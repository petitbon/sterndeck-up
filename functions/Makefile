
newuser:
	gcloud functions deploy store-newuser --runtime "nodejs18" --trigger-event "providers/firebase.auth/eventTypes/user.create"  --entry-point "newUser" --source "./store-newuser"

h: 
	gcloud functions deploy hello --gen2 --runtime=nodejs18 --region=us-central1 --source=./hello --entry-point=hello --trigger-http

comp:
	gcloud functions deploy completion --gen2 --runtime=nodejs18 --region=us-central1 --source=./completion --entry-point=completion --trigger-http

update:
	gcloud functions deploy update-finetune --gen2 --runtime "nodejs18" --trigger-http  --entry-point "updateFinetune" --source "./update-finetune" --env-vars-file "./update-finetune/.env.yaml" 


pub:
	gcloud functions deploy pub-finetune-created --runtime=nodejs18 --trigger-event=providers/cloud.firestore/eventTypes/document.create --trigger-resource=projects/sterndeck-4/databases/\(default\)/documents/models/{userUid}/list/{modelId}/fine_tunes/{fineTuneId} --entry-point "pubFinetuneCreated" --source "./pub-finetune-created"
