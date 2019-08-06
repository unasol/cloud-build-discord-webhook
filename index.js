const Discord = require("discord.js");
const URL = require("url");

// Documentation:
// https://cloud.google.com/cloud-build/docs/configure-third-party-notifications

//Insert your webhook url
const webhookUrl = "https://discordapp.com/api/webhooks/{DISCORD-ID}/{TOKEN}";

// eventToBuild transforms pubsub event message to a build object.
const eventToBuild = data => {
  return JSON.parse(Buffer.from(data, "base64").toString());
};

// createSlackMessage create a message from a build object.
const createSlackMessage = build => {
  const message = {
    text: `Build \`${build.id}\``,
    mrkdwn: true,
    attachments: [
      {
        title: "Build logs",
        title_link: build.logUrl,
        fields: [
          {
            title: "Status",
            value: build.status
          }
        ]
      }
    ]
  };
  return message;
};

module.exports.subscribeCloudBuild = async (event, callback) => {
  const url = URL.parse(webhookUrl);
  try {
    if (url.pathname === undefined) throw new Error("Url.parse Error");
    const discordId = url.pathname.split("/")[3];
    const webHookToken = url.pathname.split("/")[4];
    const webhook = new Discord.WebhookClient(discordId, webHookToken);

    const build = eventToBuild(event.data.data);

    // Skip if the current status is not in the status list.
    // Add additional statues to list if you'd like:
    // QUEUED, WORKING, SUCCESS, FAILURE,
    // INTERNAL_ERROR, TIMEOUT, CANCELLED
    const status = ["SUCCESS", "FAILURE", "INTERNAL_ERROR", "TIMEOUT"];
    if (status.indexOf(build.status) === -1) {
      return callback();
    }

    // Send message to Slack.
    const message = createSlackMessage(build);
    await webhook.sendSlackMessage(message);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
