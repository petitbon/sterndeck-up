update:
	gcloud functions deploy update-finetune --runtime "nodejs18" --trigger-service-account "sa-workflow@sterndeck-4.iam.gserviceaccount.com" --trigger-http  --entry-point "updateFinetune" --source "./update-finetune" --env-vars-file "./update-finetune/.env.yaml"

store:
	gcloud functions deploy store-newuser --runtime "nodejs18" --trigger-event "providers/firebase.auth/eventTypes/user.create"  --entry-point "newUser" --source "./store-newuser"

pub:
	gcloud functions deploy pub-finetune-created --runtime=nodejs18 --trigger-event=providers/cloud.firestore/eventTypes/document.create --trigger-resource=projects/sterndeck-4/databases/\(default\)/documents/models/{userUid}/list/{modelId}/fine_tunes/{fineTuneId} --entry-point "pubFinetuneCreated" --source "./pub-finetune-created"
