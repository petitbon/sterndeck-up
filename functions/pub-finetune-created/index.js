const { PubSub } = require("@google-cloud/pubsub");

const topicName = "finetunecreated";

const pubsub = new PubSub();

exports.pubFinetuneCreated = async (event, context) => {
  const topic = pubsub.topic(topicName);
  const [exists] = await topic.exists();
  if (!exists) {
    await pubsub.createTopic(topicName);
  }

  const messageBuff = Buffer.from(JSON.stringify(context.params));

  try {
    const messageId = await pubsub
      .topic(topicName)
      .publishMessage({ data: messageBuff });
    return messageId;
  } catch (err) {
    console.error(err);
    return Promise.reject(err);
  }
};
