const processCoordinates = require("./src/services/workerService");

async function test(){
    const result = await processCoordinates({
        vehicleId:101,
        latitude:"17.385",
        longitude:"78.486"
    });
    console.log(result);
}

test();