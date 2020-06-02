var inquirer = require("inquirer");
const execa = require("execa");
const chalk = require("chalk");

const eCommerceApps = ["eCommerce", "eCommerce-admin"];
const eCommerceTicketInitials = "WT-";

const ambassadorApps = ["ambassador", "ambassador-admin"];
const ambassadorTicketInitials = "WTA-";

const validateTicketID = (app, ticket) => {
  if (eCommerceApps.includes(app)) {
    if (!ticket.match(new RegExp(`^${eCommerceTicketInitials}\\d+`))) {
      return {
        isValid: false,
        message: `Ticket ID initials mismatch. Expected '${eCommerceTicketInitials}<number>'`,
      };
    }
  }

  if (ambassadorApps.includes(app)) {
    if (!ticket.match(new RegExp(`^${ambassadorTicketInitials}\\d+`)))
      return {
        isValid: false,
        message: `Ticket ID initials mismatch. Expected '${ambassadorTicketInitials}<number>'`,
      };
  }

  return {
    isValid: true,
    message: "",
  };
};

const createBranch = async () => {
  try {
    const answers = await inquirer.prompt([
      {
        type: "list",
        name: "app",
        message: "Please choose app",
        choices: ["eCommerce", "eCommerce-admin", "ambassador", "ambassador-admin"],
      },
      {
        type: "list",
        name: "scope",
        message: "Please enter app scope for the branch",
        choices: ["design", "implementation"],
      },
      {
        name: "ticketID",
        message: "Please enter the Jira ticket ID of the task",
      },
      {
        name: "desc",
        message: "Please enter the task description(max words 3) - Optional?",
      },
    ]);

    if (answers) {
      const app = answers.app || "";
      const scope = answers.scope === "implementation" ? "" : `/${answers.scope}`;
      const ticketID = answers.ticketID || "";
      const desc = answers.desc ? `/${answers.desc}` : "";

      if (!ticketID) throw new Error("Ticket ID is compulsory.");

      const { isValid, message } = validateTicketID(app, ticketID);
      if (!isValid) {
        throw new Error(message);
      }

      const branchName = `${app}${scope}/${ticketID}${desc}`;

      const { failed } = await execa("git", ["branch", [branchName]]);

      if (!failed) {
        const { failed: checkoutFail } = await execa("git", ["checkout", [branchName]]);
        checkoutFail
          ? console.log(chalk.red(`Branch ${branchName} created, but checkout failed`))
          : console.log(chalk.green(`Now on branch ${branchName}`));
      }
    }
  } catch (err) {
    console.log(chalk.red(err.message));
  }
};

createBranch();
