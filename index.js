const Discord = require("discord.js");
const URL = require("url");
const humanizeDuration = require("humanize-duration");

// Documentation:
// https://cloud.google.com/cloud-build/docs/configure-third-party-notifications

//Insert your webhook url
const webhookUrl =
"https://discordapp.com/api/webhooks/WEBHOOK_ID/WEBHOOK_TOKEN";

// eventToBuild transforms pubsub event message to a build object.
const eventToBuild = data => {
  return JSON.parse(new Buffer(data, "base64").toString());
};

// custom embed color
const colors = {
  FAILURE: 6887205,
  SUCCESS: 4886754,
  INTERNAL_ERROR: 16098851,
  TIMEOUT: 9442302
};

// get color by status
const getColor = status => {
  return colors[status];
};

// createDiscordMessage create a message from a build object.
const createDiscordMessage = build => {
  const version = build.tags ? build.tags.toString() : build.id;
  let duration = humanizeDuration(
    new Date(build.finishTime) - new Date(build.startTime)
  );

  return {
    content: `${build.projectId} ${version} build status ${build.status}`,
    embeds: [
      {
        title: `Build ${version}`,
        description: `Finished with status ${build.status}, in ${duration}.`,
        url: build.logUrl,
        color: getColor(build.status),
        timestamp: new Date(),
        footer: {
          icon_url: "https://github.com/unasol.png",
          text: "Powered by UNA SOLUTIONS"
        },
        author: {
          name: `${build.projectId}`,
          icon_url: "https://github.com/google-cloud-build.png"
        },
        fields: [
          {
            name: "Build id",
            value: `\`\`\`${build.id}\`\`\``
          }
        ]
      }
    ]
  };
};

module.exports.subscribeCloudBuild = async (event, callback) => {
  const url = URL.parse(webhookUrl);
  try {
    if (url.pathname === undefined) throw new Error("Url.parse Error");
    const discordId = url.pathname.split("/")[3];
    const webHookToken = url.pathname.split("/")[4];
    const webhook = new Discord.WebhookClient(discordId, webHookToken);
    const build = eventToBuild(event.data);

    // Skip if the current status is not in the status list.
    // Add additional statues to list if you'd like:
    // QUEUED, WORKING, SUCCESS, FAILURE,
    // INTERNAL_ERROR, TIMEOUT, CANCELLED
    const status = ["SUCCESS", "FAILURE", "INTERNAL_ERROR", "TIMEOUT"];
    if (status.indexOf(build.status) === -1) {
      return false;
    }

    // Send message to Discord.
    const message = createDiscordMessage(build);
    await webhook.send(message.content, { embeds: [...message.embeds] });
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
