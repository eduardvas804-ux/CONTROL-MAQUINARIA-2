const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = path.join(__dirname, '../../CONTROL DE MAQUINARIA.xlsx');
const workbook = XLSX.readFile(filePath);

let output = [];

output.push('=== ANÁLISIS DEL ARCHIVO EXCEL ===\n');
output.push('Hojas encontradas: ' + JSON.stringify(workbook.SheetNames) + '\n\n');

workbook.SheetNames.forEach(sheetName => {
    output.push(`\n${'='.repeat(60)}`);
    output.push(`HOJA: ${sheetName}`);
    output.push('='.repeat(60) + '\n');

    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

    // Obtener rango de la hoja
    const range = sheet['!ref'];
    output.push(`Rango: ${range || 'N/A'}`);

    // Contar filas con datos
    const nonEmptyRows = data.filter(row => row && row.some(cell => cell !== ''));
    output.push(`Total filas con datos: ${nonEmptyRows.length}\n`);

    // Mostrar primeras 15 filas con datos
    output.push('--- PRIMERAS FILAS ---\n');
    let rowCount = 0;
    for (let i = 0; i < data.length && rowCount < 15; i++) {
        const row = data[i];
        if (row && row.some(cell => cell !== '')) {
            // Filtrar celdas vacías y mostrar solo las primeras 12 columnas
            const relevantCells = [];
            for (let j = 0; j < Math.min(row.length, 12); j++) {
                if (row[j] !== '') {
                    relevantCells.push(`[${j}]${row[j]}`);
                }
            }
            if (relevantCells.length > 0) {
                output.push(`Fila ${i + 1}: ${relevantCells.join(' | ')}`);
                rowCount++;
            }
        }
    }
});

// Escribir a archivo
const outputPath = path.join(__dirname, 'excel-analysis.txt');
fs.writeFileSync(outputPath, output.join('\n'), 'utf8');
console.log('Análisis guardado en:', outputPath);
console.log('\n' + output.join('\n'));
