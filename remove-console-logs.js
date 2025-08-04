const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Función para reemplazar console.log con función vacía
async function removeConsoleLogs(filePath) {
     let content = fs.readFileSync(filePath, 'utf8');

     // Patrones para remover diferentes tipos de console
     const patterns = [
          /console\.log\([^)]*\);?/g,
          /console\.debug\([^)]*\);?/g,
          /console\.info\([^)]*\);?/g,
          /console\.warn\([^)]*\);?/g,
          // Mantener console.error para errores importantes
          // /console\.error\([^)]*\);?/g
     ];

     let modified = false;
     patterns.forEach(pattern => {
          if (pattern.test(content)) {
               content = content.replace(pattern, '');
               modified = true;
          }
     });

     if (modified) {
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`✅ Removed console logs from: ${filePath}`);
     }
}

// Función principal
async function main() {
     try {
          // Buscar archivos JS en el directorio de distribución
          const distPath = path.join(__dirname, 'dist/sistema-jass/**/*.js');
          const files = await glob(distPath);

          console.log(`🔄 Processing ${files.length} JavaScript files...`);

          for (const file of files) {
               try {
                    await removeConsoleLogs(file);
               } catch (error) {
                    console.error(`❌ Error processing ${file}:`, error.message);
               }
          }

          console.log('✅ Console log removal completed!');
     } catch (error) {
          console.error('❌ Error during console log removal:', error);
          process.exit(1);
     }
}

// Ejecutar función principal
main();
