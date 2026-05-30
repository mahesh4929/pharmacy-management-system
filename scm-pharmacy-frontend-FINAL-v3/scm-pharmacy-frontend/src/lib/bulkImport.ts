"use client";

import * as XLSX from "xlsx";

/**
 * Represents a single row parsed from the uploaded CSV/Excel file.
 * Field names match what POST /stock/new expects.
 */
export interface BulkStockRow {
  name: string;
  description: string;
  count: number;
  price: number;
  expiryDate?: string; // Optional - format: yyyy-MM-dd
  // Internal: row number from the file (for error reporting)
  __rowNum?: number;
}

/**
 * Parses a CSV or Excel (.xlsx, .xls) file into an array of BulkStockRow objects.
 *
 * Expected columns (case-insensitive, in any order):
 *   - name (required)
 *   - description
 *   - count (required, integer)
 *   - price (required, number)
 *   - expiryDate (optional, format yyyy-MM-dd or Excel date)
 *
 * Returns:
 *   - rows: array of parsed rows
 *   - errors: array of error messages for rows that couldn't be parsed
 */
export async function parseBulkStockFile(file: File): Promise<{
  rows: BulkStockRow[];
  errors: string[];
}> {
  const errors: string[] = [];
  const rows: BulkStockRow[] = [];

  try {
    // SheetJS supports both .csv and .xlsx/.xls from ArrayBuffer
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array", cellDates: true });

    // Use the first sheet
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      errors.push("File has no sheets / no data");
      return { rows, errors };
    }

    const sheet = workbook.Sheets[sheetName];

    // Convert to array of objects keyed by header row
    // raw: false converts numbers/dates to strings; we re-parse them ourselves
    // for tighter control
    const jsonRows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
      defval: "",
      raw: false,
    });

    if (jsonRows.length === 0) {
      errors.push("File is empty (no data rows after header)");
      return { rows, errors };
    }

    jsonRows.forEach((row, idx) => {
      // Row number in spreadsheet is idx + 2 (idx is 0-based, +1 for header)
      const rowNum = idx + 2;

      // Normalize keys to lowercase for forgiving column names
      const norm: Record<string, any> = {};
      Object.keys(row).forEach((k) => {
        norm[k.trim().toLowerCase()] = row[k];
      });

      const name = String(norm["name"] || "").trim();
      const description = String(norm["description"] || "").trim();
      const countRaw = norm["count"];
      const priceRaw = norm["price"];
      const expiryRaw = norm["expirydate"] || norm["expiry_date"] || norm["expiry"];

      // Validate required fields
      if (!name) {
        errors.push(`Row ${rowNum}: missing "name"`);
        return;
      }

      const count = parseInt(String(countRaw), 10);
      if (isNaN(count) || count < 0) {
        errors.push(`Row ${rowNum}: invalid "count" (got "${countRaw}")`);
        return;
      }

      const price = parseFloat(String(priceRaw));
      if (isNaN(price) || price <= 0) {
        errors.push(`Row ${rowNum}: invalid "price" (got "${priceRaw}")`);
        return;
      }

      // Expiry date is optional
      let expiryDate: string | undefined = undefined;
      if (expiryRaw) {
        const dateStr = formatToISODate(expiryRaw);
        if (dateStr) {
          expiryDate = dateStr;
        } else {
          errors.push(
            `Row ${rowNum}: invalid "expiryDate" "${expiryRaw}" — must be yyyy-MM-dd format`
          );
          // Don't return - just skip expiry, the row is still importable
        }
      }

      rows.push({
        name,
        description,
        count,
        price,
        expiryDate,
        __rowNum: rowNum,
      });
    });
  } catch (err: any) {
    errors.push(`File parsing failed: ${err.message || "unknown error"}`);
  }

  return { rows, errors };
}

/**
 * Tries to normalize various date inputs to yyyy-MM-dd.
 * Accepts Date objects (from Excel), strings like "2027-06-30",
 * or strings like "30/06/2027", "30-06-2027".
 * Returns null if it can't parse.
 */
function formatToISODate(raw: any): string | null {
  if (!raw) return null;

  // SheetJS returns Date object when cellDates: true and cell is a date
  if (raw instanceof Date) {
    return toISO(raw);
  }

  const s = String(raw).trim();
  if (!s) return null;

  // Already in yyyy-MM-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    return s;
  }

  // Try dd/MM/yyyy or dd-MM-yyyy
  const dmy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmy) {
    const [, d, m, y] = dmy;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  // Fallback: let Date() try to parse
  const date = new Date(s);
  if (!isNaN(date.getTime())) {
    return toISO(date);
  }

  return null;
}

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Provides a sample CSV that admins can download as a template.
 * This guarantees they use the correct column names and date format.
 */
export const SAMPLE_CSV_CONTENT = `name,description,count,price,expiryDate
Crocin Advance,Strip of 15 tablets - Pain & Fever (GSK),200,42.00,2027-12-31
Dolo 650,Strip of 15 tablets - Paracetamol 650mg (Micro Labs),300,45.50,2027-08-15
Ecosprin 75mg,Strip of 14 tablets - Aspirin for cardiac care,150,15.75,2027-10-20
Pan D,Strip of 15 capsules - Pantoprazole + Domperidone,180,89.00,2027-06-30
Cetzine 10mg,Strip of 10 tablets - Cetirizine for allergies,500,28.50,2028-01-15
`;

/**
 * Triggers browser download of the sample CSV template.
 */
export function downloadSampleCSV(): void {
  const blob = new Blob([SAMPLE_CSV_CONTENT], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "medicines-template.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
