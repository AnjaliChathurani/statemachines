import { createMachine, interpret } from "xstate";
import readlineSync from "readline-sync";

const EVchargingMachine = createMachine(
  {
    id: "evChargingStation",
    initial: "idle",
    context: {
      isAuthorized: false,
    },
    states: {
     idle: {
        on: {
          AuthR: "CheckAuthorized",
        },
      },
      CheckAuthorized: {
        always: [
          { target: "authorized", cond: "isAuthorizedSuccess" },
          { target: "authorizationFailed" },
        ]
      },
      authorized: {
        on: {
          s: "starting",
          r: "idle",
        },
      },
      authorizationFailed: {
        on: {
          RETRY: "idle",
        },
      },
      starting: {
        on: {
          c: "charging",
          r: "idle",
        },
      },
      charging: {
        on: {
          t: "stopped",
          r: "idle",
        },
      },
      stopped: {
        on: {
          r: "idle",
        },
      },
    },
  },
  {
    guards: {
      isAuthorizedSuccess: (context) => {
        const success = Math.random() > 0.7;
        console.log(`Authorization: ${success ? "Success" : "Failed"}`);
        return success;
      },
    },
  }
);

const task = interpret(EVchargingMachine).start();
let previousSt = task.state.value;
task.onTransition((state, event) => {
  console.log(`Current state: ${state.value}`);
  console.log(
    `Transitioned from ${previousSt} to ${state.value} on ${event}.`
  );
  previousSt = state.value;
});
const handleKeyBoardInput = () => {
  while (true) {
    console.log("\nCurrent State:", task.state.value);

    console.log(
      "Press AuthR to initiate authorization, f for failed authorization, s to start charging, c to begin charging, t to stop charging, r to reset."
    );
    const validCharacters = ["AuthR", "s", "c", "t", "r", "RETRY"];
    const events = readlineSync.question("Select Your choice: ", {
      limit: validCharacters,
    });

    task.send(events);
    console.log("Entered  " + "" + events + "" + " state");
  }
};

console.log("HI! Welcome to the EV Charging Station");
console.log(
  "Press AuthR to initiate authorization, f for failed authorization, s to start charging, c to begin charging, t to stop charging, r to reset."
);

handleKeyBoardInput();
