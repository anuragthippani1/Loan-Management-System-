const { exec } = require("child_process");

const PORT = 7000;

// Function to kill process on port
function killProcessOnPort(port) {
  const command =
    process.platform === "win32"
      ? `netstat -ano | findstr :${port}`
      : `lsof -i :${port} | grep LISTEN`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.log(`No process found on port ${port}`);
      return;
    }

    if (stderr) {
      console.error(`Error: ${stderr}`);
      return;
    }

    // Parse the process ID
    let pid;
    if (process.platform === "win32") {
      const lines = stdout.split("\n");
      for (const line of lines) {
        if (line.includes(`:${port}`)) {
          const parts = line.trim().split(/\s+/);
          pid = parts[parts.length - 1];
          break;
        }
      }
    } else {
      const lines = stdout.split("\n");
      for (const line of lines) {
        if (line.includes(`:${port}`)) {
          const parts = line.trim().split(/\s+/);
          pid = parts[1];
          break;
        }
      }
    }

    if (pid) {
      const killCommand =
        process.platform === "win32"
          ? `taskkill /F /PID ${pid}`
          : `kill -9 ${pid}`;

      exec(killCommand, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error killing process: ${error}`);
          return;
        }
        console.log(`Successfully killed process ${pid} on port ${port}`);
      });
    } else {
      console.log(`No process found on port ${port}`);
    }
  });
}

// Execute the function
killProcessOnPort(PORT);
