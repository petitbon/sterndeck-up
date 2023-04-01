make-event-fine-tunes-create:
	gcloud functions deploy event-fine-tunes-create  --source "./event-fine-tunes-create" --trigger-event "providers/cloud.firestore/eventTypes/document.create" --trigger-resource=projects/sterndeck-4/databases/\(default\)/documents/models/{userUid}/list/{modelId}/training_files/{trainingFileId}/fine_tunes/{fineTuneId} --entry-point "fineTunesCreate" --runtime "nodejs18"

make-event-user-create:
	gcloud functions deploy event-user-create --source "./event-user-create" --trigger-event "providers/firebase.auth/eventTypes/user.create" --entry-point "userCreate" --runtime "nodejs18" 

make-http-completion:
	gcloud functions deploy http-completion --gen2 --trigger-http --source=./http-completion --entry-point=completion  --runtime=nodejs18 --region=us-central1 --set-env-vars PROJECT_ID=117456302577

make-http-csv-upload:
	gcloud functions deploy http-csv-upload --gen2 --trigger-http --source=./http-csv-upload --entry-point=csvUpload --runtime=nodejs18 --region=us-central1 --set-env-vars PROJECT_NAME=sterndeck-4

make-http-fine-tunes-cancel:
	gcloud functions deploy http-fine-tunes-cancel --gen2 --trigger-http --source "./http-fine-tunes-cancel" --entry-point "fineTunesCancel" --runtime "nodejs18" --set-env-vars PROJECT_ID=117456302577


make-http-fine-tunes-create:
	gcloud functions deploy http-fine-tunes-create --gen2 --trigger-http --source "./http-fine-tunes-create" --entry-point "fineTunesCreate" --runtime "nodejs18" --set-env-vars PROJECT_ID=117456302577

make-http-fine-tunes-update:
	gcloud functions deploy http-fine-tunes-update --gen2 --trigger-http --source "./http-fine-tunes-update" --entry-point "fineTunesUpdate" --runtime "nodejs18" --set-env-vars PROJECT_ID=117456302577

make-http-hello:
	gcloud functions deploy http-hello --gen2 --trigger-http --source=./http-hello --entry-point=hello --runtime=nodejs18 --region=us-central1

make-http-models-feedback:
	gcloud functions deploy http-models-feedback --gen2 --trigger-http --source "./http-models-feedback" --entry-point "modelsFeedback" --runtime "nodejs18" --set-env-vars PROJECT_ID=117456302577

make-http-models-feedback-collect:
	gcloud functions deploy http-models-feedback-collect --gen2 --trigger-http --source "./http-models-feedback-collect" --entry-point "feedbackCollect" --runtime "nodejs18" --set-env-vars PROJECT_ID=117456302577

make-http-user-secret-create:
	gcloud functions deploy http-user-secret-create --gen2 --trigger-http --source "./http-user-secret-create" --entry-point "userSecretCreate" --runtime "nodejs18" --set-env-vars PROJECT_ID=117456302577


