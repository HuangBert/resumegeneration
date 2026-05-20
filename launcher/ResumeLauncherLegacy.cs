using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Text;
using System.Threading;

internal static class Program
{
    private const int Port = 5173;
    private const string Url = "http://127.0.0.1:5173/";

    private static int Main()
    {
        Console.OutputEncoding = Encoding.UTF8;
        var root = FindProjectRoot();

        Console.WriteLine("Markdown Resume Generator 启动器");
        Console.WriteLine("项目目录: " + root);

        if (!File.Exists(Path.Combine(root, "package.json")) || !File.Exists(Path.Combine(root, "resume.md")))
        {
            Console.Error.WriteLine("未找到 package.json 或 resume.md，请从项目根目录运行启动器。");
            WaitBeforeExit();
            return 1;
        }

        if (!Directory.Exists(Path.Combine(root, "node_modules")))
        {
            Console.WriteLine("检测到尚未安装依赖，正在执行 npm.cmd install...");
            var installCode = RunForeground("cmd.exe", BuildCmdArguments("npm.cmd install", root), root);
            if (installCode != 0)
            {
                Console.Error.WriteLine("依赖安装失败，退出码: " + installCode);
                WaitBeforeExit();
                return installCode;
            }
        }

        Console.WriteLine("正在启动本地预览服务...");
        using (var server = StartServer(root))
        {
            if (!WaitAndOpenBrowser())
            {
                Console.WriteLine("服务启动中。若浏览器未自动打开，请手动访问: " + Url);
            }

            Console.WriteLine("服务运行中，按 Ctrl+C 停止。");
            server.WaitForExit();
            return server.ExitCode;
        }
    }

    private static string FindProjectRoot()
    {
        var current = Directory.GetCurrentDirectory();
        if (LooksLikeProjectRoot(current))
        {
            return current;
        }

        var executableDir = AppDomain.CurrentDomain.BaseDirectory;
        var candidates = new[]
        {
            executableDir,
            Path.GetFullPath(Path.Combine(executableDir, "..")),
            Path.GetFullPath(Path.Combine(executableDir, "..", ".."))
        };

        foreach (var candidate in candidates)
        {
            if (LooksLikeProjectRoot(candidate))
            {
                return candidate;
            }
        }

        return current;
    }

    private static bool LooksLikeProjectRoot(string path)
    {
        return File.Exists(Path.Combine(path, "package.json"))
            && File.Exists(Path.Combine(path, "resume.md"));
    }

    private static Process StartServer(string root)
    {
        var process = new Process();
        process.StartInfo = CreateProcessStartInfo("cmd.exe", BuildCmdArguments("npm.cmd run dev -- --port " + Port, root), root);
        process.Start();
        return process;
    }

    private static int RunForeground(string fileName, string arguments, string root)
    {
        using (var process = new Process())
        {
            process.StartInfo = CreateProcessStartInfo(fileName, arguments, root);
            process.Start();
            process.WaitForExit();
            return process.ExitCode;
        }
    }

    private static ProcessStartInfo CreateProcessStartInfo(string fileName, string arguments, string root)
    {
        var startInfo = new ProcessStartInfo(fileName, arguments);
        startInfo.WorkingDirectory = root;
        startInfo.UseShellExecute = false;
        startInfo.RedirectStandardOutput = false;
        startInfo.RedirectStandardError = false;
        startInfo.CreateNoWindow = false;
        return startInfo;
    }

    private static string BuildCmdArguments(string command, string root)
    {
        var cache = Path.Combine(root, ".npm-cache");
        return "/c \"set \"npm_config_cache=" + cache + "\"&& " + command + "\"";
    }

    private static bool WaitAndOpenBrowser()
    {
        for (var attempt = 0; attempt < 40; attempt++)
        {
            try
            {
                var request = (HttpWebRequest)WebRequest.Create(Url);
                request.Method = "GET";
                request.Timeout = 1000;
                using (var response = (HttpWebResponse)request.GetResponse())
                {
                    if (response.StatusCode == HttpStatusCode.OK)
                    {
                        try
                        {
                            Process.Start(new ProcessStartInfo(Url) { UseShellExecute = true });
                        }
                        catch
                        {
                            Console.WriteLine("浏览器未能自动打开，请手动访问: " + Url);
                        }

                        return true;
                    }
                }
            }
            catch
            {
                Thread.Sleep(500);
            }
        }

        return false;
    }

    private static void WaitBeforeExit()
    {
        Console.WriteLine("按任意键关闭窗口...");
        Console.ReadKey(true);
    }
}
