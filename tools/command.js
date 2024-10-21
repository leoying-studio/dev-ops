const { exec } = require("child_process");

const createExecution = (command) => {
  return () => {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout);
        }
      });
    });
  };
};

const execCommands = async (commands) => {
  const executions = commands.map((command) => createExecution(command));
  for (const item of executions) {
    await item();
  }
};

module.exports.exec = execCommands;