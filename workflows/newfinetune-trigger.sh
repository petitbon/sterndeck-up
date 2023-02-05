gcloud services enable cloudbuild.googleapis.com \
  eventarc.googleapis.com \
  logging.googleapis.com \
  pubsub.googleapis.com \
  run.googleapis.com \
  workflows.googleapis.com



gcloud eventarc triggers update pubfinetunecreated \
--location=us-central1 \
--service-account=sa-workflow@sterndeck-4.iam.gserviceaccount.com \
--transport-topic=projects/sterndeck-4/topics/newfinetune \
--destination-workflow=helloworld \
--destination-workflow-location=us-central1 \
--event-filters="type=google.cloud.pubsub.topic.v1.messagePublished"

