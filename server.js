// Require libraries
var os = require("os");
var fs = require("fs");
var readline = require("readline");
var cluster = require("cluster");
var express = require("express");
var site = express();

// Var up, bro
var i, read;
var forks = [];
var prefix = "server ~ ";

// Master thread spawns new listeners
if (cluster.isMaster) {
  function create() {
    // Spawn a new worker for each available thread
    for (i = 0; i < os.cpus().length; i++) {
      forks.push(cluster.fork());
    }
  }

  function destroy() {
    // Destroy all original forks
    forks.forEach(function(fork) {
      fork.send({ cmd: "kill" });
    });

    forks = [];
  }

  var command;
  var commands = {
    "status": function() {
      forks.forEach(function(fork) {
        console.log("Worker", fork.pid, fork.online ? "online" : "offline");
      });
    },

    // Destroy all forks and respawn new ones
    "restart": function() {
      destroy() && create();
    },

    // Destroy all forks and kill this master process
    "stop": function() {
      destroy();

      process.exit(0);
    }
  };

  // Spin up initial forks
  create();

  // Define prompt
  read = readline.createInterface(process.stdin, process.stdout);

  // Wait for data
  read.on("line", function(line) {
    command = line.trim()

    // Detect if command exists
    if (command in commands) {
      commands[command]();
    }

    // Re-Show the prompt
    read.setPrompt(prefix, prefix.length);
    read.prompt();
  })

  read.on("close", function() {
    destroy();
    process.exit(0);
  });

  // Show prompt
  read.setPrompt(prefix, prefix.length);
  read.prompt();

  return;
}

// Kill off the process
process.on("message", function(msg) {
  if (msg.cmd && msg.cmd == "kill") {
    process.exit();
  }
});

// Serve static files
site.use("/", express.static(__dirname + '/dist'));

// API serving will happen here
// site.use("/api", ...);

// Ensure all routes go home, client side app..
site.get("*", function(req, res) {
  fs.createReadStream(__dirname + "/dist/index.html").pipe(res);
});

// Actually listen
site.listen(process.env.PORT || 8080);
