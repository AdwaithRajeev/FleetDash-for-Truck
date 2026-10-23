const { Worker } = require("worker_threads");
const path = require("path");
const { logInfo, logError } = require("../utils/logger");

const worker = new Worker(
    path.resolve(__dirname, "../workers/coordinateWorker.js")
);
logInfo("Worker Created.");

// function called by workerService using VehicleData as argument
function processCoordinates(data) {
    // Promise is used to ensure API waits for result without blocking event loop.
    return new Promise((resolve, reject) => {       // worker is created
        worker.postMessage(data);  //sending data

        worker.once("message", (result) => {
                    if (result.error) 
                    {
                        logError(result.error);
                    } 
                    else 
                    {
                        logInfo("Coordinate Processed and sent to Controller");
                    }
                    resolve(result);
                });

        worker.once("error", (err) => {
                    reject(err);
                }); //Error Handling

    });
}

module.exports = processCoordinates;