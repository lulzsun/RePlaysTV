using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading.Tasks;

namespace RePlaysTV_Installer.Helper
{
    public static class AsynchronousFileHelper
    {
        /// <summary>
        ///     This is the same default buffer size as
        ///     <see cref="StreamReader" /> and <see cref="FileStream" />.
        /// </summary>
        private const int DefaultBufferSize = 4096;

        /// <summary>
        ///     Indicates that
        ///     1. The file is to be used for asynchronous reading.
        ///     2. The file is to be accessed sequentially from beginning to end.
        /// </summary>
        private const FileOptions DefaultOptions = FileOptions.Asynchronous | FileOptions.SequentialScan;

        public static async Task<string[]> ReadAllLinesAsync(string path)
        {
            return await ReadAllLinesAsync(path, Encoding.UTF8);
        }

        public static async Task<string[]> ReadAllLinesAsync(string path, Encoding encoding)
        {
            var lines = new List<string>();

            // Open the FileStream with the same FileMode, FileAccess
            // and FileShare as a call to File.OpenText would've done.
            using (var stream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.Read, DefaultBufferSize,
                DefaultOptions))
            using (var reader = new StreamReader(stream, encoding))
            {
                string line;
                while ((line = await reader.ReadLineAsync()) != null) lines.Add(line);
            }

            return lines.ToArray();
        }

        public static async Task WriteAllLinesAsync(string path, List<string> linesToWrite)
        {
            await WriteAllLinesAsync(path, Encoding.UTF8, linesToWrite.ToArray());
        }

        public static async Task WriteAllLinesAsync(string path, IEnumerable<string> linesToWrite)
        {
            await WriteAllLinesAsync(path, Encoding.UTF8, linesToWrite);
        }

        public static async Task WriteAllLinesAsync(string path, Encoding encoding, IEnumerable<string> linesToWrite)
        {
            // Open the FileStream with the same FileMode, FileAccess
            // and FileShare as a call to File.OpenText would've done.
            using (var stream = new FileStream(path, FileMode.OpenOrCreate, FileAccess.Write, FileShare.None,
                DefaultBufferSize, DefaultOptions))
            using (var writer = new StreamWriter(stream, encoding))
            {
                foreach (var line in linesToWrite) await writer.WriteLineAsync(line);
            }
        }
    }
}