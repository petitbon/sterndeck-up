make-event-finetune-create:
	gcloud functions deploy event-finetune-create --trigger-event "providers/cloud.firestore/eventTypes/document.create" --trigger-resource=projects/sterndeck-4/databases/\(default\)/documents/models/{userUid}/list/{modelId}/fine_tunes/{fineTuneId} --entry-point "publishFinetune" --runtime "nodejs18" --source "./event-finetune-create"

make-event-user-create:
	gcloud functions deploy event-user-create --trigger-event "providers/firebase.auth/eventTypes/user.create" --entry-point "storeNewUser" --runtime "nodejs18" --source "./event-user-create"

make-http-completion:
	gcloud functions deploy http-completion --gen2 --trigger-http --source=./http-completion --entry-point=completion  --runtime=nodejs18 --region=us-central1 --set-env-vars PROJECT_ID=117456302577

make-http-csv-upload:
	gcloud functions deploy http-csv-upload --gen2 --trigger-http --source=./http-csv-upload --entry-point=upload --runtime=nodejs18 --region=us-central1 --set-env-vars PROJECT_NAME=sterndeck-4

make-http-hello:
	gcloud functions deploy http-hello --gen2 --trigger-http --source=./http-hello --entry-point=hello --runtime=nodejs18 --region=us-central1

make-http-update-finetune:
	gcloud functions deploy http-update-finetune --gen2 --trigger-http --source "./http-update-finetune" --entry-point "updateFinetune" --runtime "nodejs18" --set-env-vars PROJECT_ID=117456302577
