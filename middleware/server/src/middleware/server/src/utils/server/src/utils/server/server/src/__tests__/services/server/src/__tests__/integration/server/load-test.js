import autocannon from "autocannon";
import { performance } from "perf_hooks";

function runLoadTest() {
  const instance = autocannon({
    url: "http://localhost:3001/api/users",
    connections: 100,
    duration: 60,
    method: "GET",
    headers: {
      Authorization: "Bearer YOUR_TEST_TOKEN",
    },
  });

  autocannon.track(instance, {
    renderProgressBar: true,
    renderResultsTable: true,
  });

  instance.on("done", (result) => {
    console.log("Load Test Results:", {
      requestsCompleted: result.requestsCompleted,
      avgLatency: result.latency.average,
      requestsPerSecond: result.requests.average,
    });
  });
}

runLoadTest();
