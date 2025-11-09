# TP3

export PROJECT_ID=gpc-tp3
export REGION=europe-southwest1-a
export BUCKET=$PROJECT_ID-bucket-cs
export BUCKET2=$PROJECT_ID-bucket-2
export PERSO_ROLE=cloudDeployBaguette

### Exercice 1 :

#### 1.

```
gcloud projects create gpc-tp3  --name gcp-tp3 --set-as-default
```

```
$ gcloud projects list
PROJECT_ID               NAME                  PROJECT_NUMBER
dynamic-digit-477110-f1  My First Project      539905814607
electric-node-477110-h9  My First Project      154220683905
gpc-tp3                  gcp-tp3               909558933043
m1-infra-archi-cloud     M1 INFRA ARCHI CLOUD  360869369145
```
Création des utilisateurs :
```
gcloud projects add-iam-policy-binding gpc-tp3   --member=user:lecteur@gmail.com   --role=roles/viewer
micheluther@michelDeskTek:~/ARCHI_CLOUD/TP3$ gcloud projects add-iam-policy-binding $PROJECT_ID --member=user:collaborateur@gmail.com   --role=roles/editor
Updated IAM policy for project [gpc-tp3].
bindings:
- members:
  - user:Collaborateur@gmail.com
  role: roles/editor
- members:
  - user:mederic.marquie@ynov.com
  role: roles/owner
- members:
  - user:lecteur@gmail.com
  role: roles/viewer
etag: BwZC6pP3iTE=
version: 1
```
Création du compte de service :
```
gcloud iam service-accounts create app-backend --display-name app-backend
Created service account [app-backend].
$ gcloud iam service-accounts list

DISPLAY NAME  EMAIL                                        DISABLED
app-backend   app-backend@gpc-tp3.iam.gserviceaccount.com  False
```
### Exercice 2 - Explorer IAM et les rôles :

#### 1. Lister

Liste des membres IAM :
```
$ gcloud projects get-ancestors-iam-policy $PROJECT_ID
---
id: gpc-tp3
policy:
  bindings:
  - members:
    - user:Collaborateur@gmail.com
    role: roles/editor
  - members:
    - user:mederic.marquie@ynov.com
    role: roles/owner
  - members:
    - user:lecteur@gmail.com
    role: roles/viewer
  etag: BwZC6pP3iTE=
  version: 1
type: project
```

### Exercice 3 - Portée des rôles et permissions atomiques.

#### 1. Lister les permissions du role objectViewer

```
$ gcloud iam roles describe roles/storage.objectViewer
description: Grants access to view objects and their metadata, excluding ACLs. Can
  also list the objects in a bucket.
etag: AA==
includedPermissions:
- resourcemanager.projects.get
- resourcemanager.projects.list
- storage.folders.get
- storage.folders.list
- storage.managedFolders.get
- storage.managedFolders.list
- storage.objects.get
- storage.objects.list
name: roles/storage.objectViewer
stage: GA
title: Storage Object Viewer
```
Création du bucket et liste des permissions :
```
gsutil mb -l ${REGION%-*} gs://$BUCKET/
Creating gs://gpc-tp3-bucket-cs/...
$ gcloud storage buckets get-iam-policy gs://$BUCKET
bindings:
- members:
  - projectEditor:gpc-tp3
  - projectOwner:gpc-tp3
  role: roles/storage.legacyBucketOwner
- members:
  - projectViewer:gpc-tp3
  role: roles/storage.legacyBucketReader
etag: CAE=
```

Ajout de la permission sur le collaborateur :
```
$ gcloud storage buckets add-iam-policy-binding gs://$BUCKET --member user:collaborateur@gmail.com --role roles/storage.objectViewer
bindings:
- members:
  - projectEditor:gpc-tp3
  - projectOwner:gpc-tp3
  role: roles/storage.legacyBucketOwner
- members:
  - projectViewer:gpc-tp3
  role: roles/storage.legacyBucketReader
- members:
  - user:Collaborateur@gmail.com
  role: roles/storage.objectViewer
etag: CAI=
kind: storage#policy
resourceId: projects/_/buckets/gpc-tp3-bucket-cs
version: 1
```
On ajoute ces droits sur le Project :
```$ gcloud projects add-iam-policy-binding $PROJECT_ID --member user:collaborateur@gmail.com --role roles/storage.objectViewer
Updated IAM policy for project [gpc-tp3].
bindings:
- members:
  - user:Collaborateur@gmail.com
  role: roles/editor
- members:
  - user:mederic.marquie@ynov.com
  role: roles/owner
- members:
  - user:Collaborateur@gmail.com
  role: roles/storage.objectViewer
- members:
  - user:lecteur@gmail.com
  role: roles/viewer
etag: BwZC63ufXSY=
version: 1
```

On va se connecter en tant que collaborateur :
```
gcloud auth login
Your browser has been opened to visit:

    https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=32555940559.apps.googleusercontent.com&redirect_uri=http%3A%2F%2Flocalhost%3A8085%2F&scope=openid+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcloud-platform+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fappengine.admin+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fsqlservice.login+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcompute+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Faccounts.reauth&state=StzEXHZbAtzTwFidls1jpHZ32vCD1b&access_type=offline&code_challenge=PhEKNxnhJn067uRtUMvVh8rs07al2yDxMQZ9bDtfSIc&code_challenge_method=S256


You are now logged in as [collaborateur0013@gmail.com].
Your current project is [gpc-tp3].  You can change this setting by running:
  $ gcloud config set project PROJECT_ID
```

On va pouvoir lister les droits sur le bucket :
```
$ gsutil ls
gs://gpc-tp3-bucket-cs/
```

On peut télécharger depuis ce bucket :
```
$ gsutil cp gs://gpc-tp3-bucket-cs/test.txt .
Copying gs://gpc-tp3-bucket-cs/test.txt...
/ [1 files][    7.0 B/    7.0 B]
Operation completed over 1 objects/7.0 B.
```
Pour un second bucket du projet :
```
$ gsutil ls
gs://gpc-tp3-bucket-2/
gs://gpc-tp3-bucket-cs/
$ gsutil cp -r . gs://$BUCKET2/
Copying file://./test.txt [Content-Type=text/plain]...
Copying file://./.TP3.md.kate-swp [Content-Type=application/octet-stream]...
Copying file://./TP3.md [Content-Type=text/markdown]...
- [3 files][  6.3 KiB/  6.3 KiB]
Operation completed over 3 objects/6.3 KiB.
```

La granularité peut être modifié via l'association de droits afin de sécuriser au mieux les infrastructures de prod ou de test.

Le principe du moindre privilège est l'accord du droit minimum de modification / écriture / lecture sur une partie donnée de l'infrastructure.

On peut enlever des droits sur un Bucket précis :
```
gcloud storage buckets remove-iam-policy-binding gs://$BUCKET/ --member=user:collaborateur0013@gmail.com --role=roles/storage.objectViewer
bindings:
- members:
  - projectEditor:gpc-tp3
  - projectOwner:gpc-tp3
  role: roles/storage.legacyBucketOwner
- members:
  - projectViewer:gpc-tp3
  role: roles/storage.legacyBucketReader
- members:
  - user:Collaborateur@gmail.com
  role: roles/storage.objectViewer
etag: CAQ=
kind: storage#policy
resourceId: projects/_/buckets/gpc-tp3-bucket-cs
```

Ou sur le projet :
```
gcloud projects remove-iam-policy-binding $PROJECT_ID --member=user:collaborateur0013@gmail.com --role=roles/storage.objectViewer
```

### Exercice 4 - Créer un rôle personnalisé pour Cloud RUN.

#### Identifier les permissions nécessaires :

```
includedPermissions:
- run.services.create ## Créer un service
- run.services.get ## Déployer un service
- run.services.list ## Lister les services
- run.services.delete ## Supprimer un service
```

#### 2. Créer un fichier yaml :

```
title: "CloudDeployBaguette"
description: "Déploiement de la baguette"
stage: "GA"
includedPermissions:
- run.services.create
- run.services.get
- run.services.list
- run.services.delete
```

Pour créer le role :
```
gcloud iam roles create cloudDeployBaguette --project=$PROJECT_ID --file=customRole.yaml
Created role [cloudDeployBaguette].
description: Déploiement de la baguette
etag: BwZC7iiF0ok=
includedPermissions:
- run.services.create
- run.services.delete
- run.services.get
- run.services.list
name: projects/gpc-tp3/roles/cloudDeployBaguette
stage: GA
title: CloudDeployBaguette
```

Attribuer le role au user collaborateur :
```
gcloud projects add-iam-policy-binding $PROJECT_ID --member=user:collaborateur0013@gmail.com --role=projects/$PROJECT_ID/roles/cloudDeployBaguette
Updated IAM policy for project [gpc-tp3].
bindings:
- members:
  - user:collaborateur0013@gmail.com
  role: projects/gpc-tp3/roles/cloudDeployBaguette
- members:
  - user:collaborateur0013@gmail.com
  role: roles/editor
- members:
  - user:mederic.marquie@ynov.com
  role: roles/owner
- members:
  - user:collaborateur0013@gmail.com
  role: roles/storage.objectViewer
- members:
  - user:lecteur@gmail.com
  role: roles/viewer
etag: BwZC7jNJhss=
version: 1
```

On va pouvoir tester sur un autre compte nos privilèges au lieu d'avoir la meme chose en tant qu'Owner du projet.

Déploiement d'un service par une image docker :
```
ID                                    CREATE_TIME                DURATION  SOURCE                                                                                IMAGES                                STATUS
8b88ec43-f581-4223-a637-6c7965372114  2025-11-06T15:27:23+00:00  38S       gs://gpc-tp3_cloudbuild/source/1762442841.84742-e84f0dcb7cb7496192c0020049bba526.tgz  gcr.io/gpc-tp3/app-backend (+1 more)  SUCCESS
micheluther@michelDeskTek:~/ARCHI_CLOUD/TP3/app-backend$ gcloud run deploy app-backend-service \
  --image=gcr.io/$PROJECT_ID/app-backend \
  --region=${REGION%-*} \
  --platform=managed \
  --allow-unauthenticated \
  --service-account=app-backend@$PROJECT_ID.iam.gserviceaccount.com \
  --set-env-vars=BUCKET_NAME=$BUCKET
```

On test notre nouveau role:
```
You are now logged in as [collaborateur0013@gmail.com].
Your current project is [gpc-tp3].  You can change this setting by running:
  $ gcloud config set project PROJECT_ID
```

On peut lister et supprimer des services :
```
micheluther@michelDeskTek:~/ARCHI_CLOUD/TP3/app-backend$ gcloud run services list --region=${REGION%-*}
   SERVICE              REGION             URL                                                                 LAST DEPLOYED BY          LAST DEPLOYED AT
X  app-backend-service  europe-southwest1  https://app-backend-service-909558933043.europe-southwest1.run.app  mederic.marquie@ynov.com  2025-11-06T15:34:19.197401Z
X  baguette-test        europe-southwest1  https://baguette-test-909558933043.europe-southwest1.run.app        mederic.marquie@ynov.com  2025-11-06T15:10:43.103666Z
micheluther@michelDeskTek:~/ARCHI_CLOUD/TP3/app-backend$ gcloud run services delete baguette-test \
  --region=${REGION%-*} \
  --quiet
Deleting [baguette-test]...done.
Deleted service [baguette-test].
```

Et si on veut nettoyer le role personnalisé :
```
micheluther@michelDeskTek:~/ARCHI_CLOUD/TP3/app-backend$ gcloud iam roles delete cloudDeployBaguette --project=$PROJECT_ID
deleted: true
description: Déploiement de la baguette
etag: BwZC7unYtdU=
includedPermissions:
- run.services.create
- run.services.delete
- run.services.get
- run.services.list
name: projects/gpc-tp3/roles/cloudDeployBaguette
stage: GA
title: CloudDeployBaguette
```

### Exercice 5 - Gérer les comptes de service et les droits applicatifs :

Attribuer le role storage au compte de service app-backend
````
gcloud storage buckets add-iam-policy-binding gs://$BUCKET \
    --member="serviceAccount:app-backend@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/storage.objectViewer"
bindings:
- members:
  - projectEditor:gpc-tp3
  - projectOwner:gpc-tp3
  role: roles/storage.legacyBucketOwner
- members:
  - projectViewer:gpc-tp3
  role: roles/storage.legacyBucketReader
- members:
  - serviceAccount:app-backend@gpc-tp3.iam.gserviceaccount.com
  - user:Collaborateur@gmail.com
  role: roles/storage.objectViewer
etag: CAU=
kind: storage#policy
resourceId: projects/_/buckets/gpc-tp3-bucket-cs
version: 1
````

Accorder les permissions : 
````
  gcloud projects add-iam-policy-binding gpc-tp3 --member="serviceAccount:402564488059@cloudbuild.gserviceaccount.com" --role="roles/storage.admin"
Updated IAM policy for project [gpc-tp3].
bindings:
- members:
  - user:collaborateur0013@gmail.com
  role: projects/gpc-tp3/roles/customCloudRunDeployer
- members:
  - serviceAccount:service-402564488059@gcp-sa-artifactregistry.iam.gserviceaccount.com
  role: roles/artifactregistry.serviceAgent
- members:
  - serviceAccount:402564488059@cloudbuild.gserviceaccount.com
  role: roles/artifactregistry.writer
- members:
  - serviceAccount:402564488059@cloudbuild.gserviceaccount.com
  role: roles/cloudbuild.builds.builder
- members:
  - serviceAccount:service-402564488059@gcp-sa-cloudbuild.iam.gserviceaccount.com
  role: roles/cloudbuild.serviceAgent
- members:
  - serviceAccount:service-402564488059@containerregistry.iam.gserviceaccount.com
  role: roles/containerregistry.ServiceAgent
- members:
  - serviceAccount:402564488059-compute@developer.gserviceaccount.com
  role: roles/editor
- members:
  - serviceAccount:402564488059@cloudbuild.gserviceaccount.com
  role: roles/logging.logWriter
- members:
  - user:mederic.marquie@ynov.com
  role: roles/owner
- members:
  - serviceAccount:service-402564488059@gcp-sa-pubsub.iam.gserviceaccount.com
  role: roles/pubsub.serviceAgent
- members:
  - serviceAccount:service-402564488059@serverless-robot-prod.iam.gserviceaccount.com
  role: roles/run.serviceAgent
- members:
  - serviceAccount:402564488059@cloudbuild.gserviceaccount.com
  role: roles/storage.admin
- members:
  - user:mederic.marquie@ynov.com
  role: roles/viewer
etag: BwZDKJyiU3c=
version: 1
````
Permissions Cloud Build : 
````
gcloud projects add-iam-policy-binding gpc-tp3 --member="serviceAccount:402564488059@cloudbuild.gserviceaccount.com" --role="roles/artifactregistry.writer"
Updated IAM policy for project [gpc-tp3].
bindings:
- members:
  - user:collaborateur0013@gmail.com
  role: projects/gpc-tp3/roles/customCloudRunDeployer
- members:
  - serviceAccount:service-402564488059@gcp-sa-artifactregistry.iam.gserviceaccount.com
  role: roles/artifactregistry.serviceAgent
- members:
  - serviceAccount:402564488059@cloudbuild.gserviceaccount.com
  role: roles/artifactregistry.writer
- members:
  - serviceAccount:402564488059@cloudbuild.gserviceaccount.com
  role: roles/cloudbuild.builds.builder
- members:
  - serviceAccount:service-402564488059@gcp-sa-cloudbuild.iam.gserviceaccount.com
  role: roles/cloudbuild.serviceAgent
- members:
  - serviceAccount:service-402564488059@containerregistry.iam.gserviceaccount.com
  role: roles/containerregistry.ServiceAgent
- members:
  - serviceAccount:402564488059-compute@developer.gserviceaccount.com
  role: roles/editor
- members:
  - serviceAccount:402564488059@cloudbuild.gserviceaccount.com
  role: roles/logging.logWriter
- members:
  - user:mederic.marquie@ynov.com
  role: roles/owner
- members:
  - serviceAccount:service-402564488059@gcp-sa-pubsub.iam.gserviceaccount.com
  role: roles/pubsub.serviceAgent
- members:
  - serviceAccount:service-402564488059@serverless-robot-prod.iam.gserviceaccount.com
  role: roles/run.serviceAgent
- members:
  - serviceAccount:402564488059@cloudbuild.gserviceaccount.com
  role: roles/storage.admin
- members:
  - user:mederic.marquie@ynov.com
  role: roles/viewer
etag: BwZDKJ_YF9o=
version: 1
````
Déploiement du Cloud Run :: 
````
gcloud run deploy run-backend --source . --region=europe-west1 --service-account=run-backend@gpc-tp3.iam.gserviceaccount.com --set-env-vars=BUCKET_NAME=$PROJECT_ID-bucket-cs --allow-unauthenticated
Deploying from source requires an Artifact Registry Docker repository to store built containers. A repository named
[cloud-run-source-deploy] in region [europe-west1] will be created.
Do you want to continue (Y/n)?  y
Building using Dockerfile and deploying container to Cloud Run service [run-backend] in project [gpc-tp3] region [europe-west1]
X  Building and deploying new service... Uploading sources.
  OK Creating Container Repository...
  OK Validating Service...
  OK Uploading sources...
  .  Building Container...
  .  Creating Revision...
  .  Routing traffic...
  .  Setting IAM Policy...
````
### Exercice 6 : 

Création du compte de service : 
````
gcloud iam service-accounts create deploy-automation --display-name="Deployment Automation"
Created service account [deploy-automation].
````
On lui accorde les droits : 
````
gcloud iam service-accounts add-iam-policy-binding deploy-automation@gpc-tp3.iam.gserviceaccount.com --member="user:mederic.marquie@ynov.com" --role="roles/iam.serviceAccountUser"
Updated IAM policy for serviceAccount [deploy-automation@gpc-tp3.iam.gserviceaccount.com].
bindings:
- members:
  - user:marquie.mederic1@gmail.com
  role: roles/iam.serviceAccountUser
etag: BwZDKMvLoko=
version: 1
````
Accord des permission : 
````
gcloud iam service-accounts add-iam-policy-binding deploy-automation@gpc-tp3.iam.gserviceaccount.com --member="user:mederic.marquie@ynov.com" --role="roles/iam.serviceAccountTokenCreator"
Updated IAM policy for serviceAccount [deploy-automation@gpc-tp3.iam.gserviceaccount.com].
bindings:
- members:
  - user:marquie.mederic1@gmail.com
  role: roles/iam.serviceAccountTokenCreator
- members:
  - user:marquie.mederic1@gmail.com
  role: roles/iam.serviceAccountUser
etag: BwZDKMv7DjQ=
version: 1
````

On test : 
````
gcloud projects list --impersonate-service-account=deploy-automation@gpc-tp3.iam.gserviceaccount.com
WARNING: This command is using service account impersonation. All API calls will be executed as [deploy-automation@gpc-tp3.iam.gserviceaccount.com].
API [cloudresourcemanager.googleapis.com] not enabled on project [402564488059]. Would you like to enable and retry
(this will take a few minutes)? (y/N)?  y
Enabling service [cloudresourcemanager.googleapis.com] on project [402564488059]...
WARNING: This command is using service account impersonation. All API calls will be executed as [deploy-automation@gpc-tp3.iam.gserviceaccount.com].
ERROR: (gcloud.projects.list) PERMISSION_DENIED: Permission denied to enable service [cloudresourcemanager.googleapis.com]
Help Token: AXcLsyA_nWssd1NR8P395vxQgm2XzkXHoxp0UEWsyK66qZc0Pyz0Exg8RmstIZMgGB-7VlqMDYQVu3l1PksAThxf7_P66t4arMZ71cS362vxIJuk. This command is authenticated as marquie.mederic1@gmail.com which is the active account specified by the [core/account] property. Impersonation is used to impersonate deploy-automation@gpc-tp3.iam.gserviceaccount.com
- '@type': type.googleapis.com/google.rpc.ErrorInfo
  domain: serviceusage.googleapis.com
  reason: AUTH_PERMISSION_DENIED
````
### Exercice 7 :


Création du fichier de condition : 
````
@"
expression: request.time < timestamp("2025-11-09T14:08:00Z")
title: Acces temporaire Cloud Run
description: Expire a 21h08 UTC
"@ | Out-File -FilePath condition-expire.yaml -Encoding utf8
````

On peu juste lui donner des droits de création :
````
gcloud projects add-iam-policy-binding gpc-tp3 --member="user:collaborateur0013@gmail.com" --role="roles/run.admin" --condition-from-file=condition-expire.yaml
WARNING: Adding binding with condition to a policy without condition will change the behavior of add-iam-policy-binding and remove-iam-policy-binding commands.
Updated IAM policy for project [gpc-tp3].
bindings:
- members:
  - user:collaborateur0013@gmail.com
  role: projects/gpc-tp3/roles/customCloudRunDeployer
- members:
  - serviceAccount:service-402564488059@gcp-sa-artifactregistry.iam.gserviceaccount.com
  role: roles/artifactregistry.serviceAgent
- members:
  - serviceAccount:402564488059@cloudbuild.gserviceaccount.com
  role: roles/artifactregistry.writer
- members:
  - serviceAccount:402564488059@cloudbuild.gserviceaccount.com
  role: roles/cloudbuild.builds.builder
- members:
  - serviceAccount:service-402564488059@gcp-sa-cloudbuild.iam.gserviceaccount.com
  role: roles/cloudbuild.serviceAgent
- members:
  - serviceAccount:service-402564488059@containerregistry.iam.gserviceaccount.com
  role: roles/containerregistry.ServiceAgent
- members:
  - serviceAccount:402564488059-compute@developer.gserviceaccount.com
  role: roles/editor
- members:
  - serviceAccount:402564488059@cloudbuild.gserviceaccount.com
  role: roles/logging.logWriter
- members:
  - user:mederic.marquie@ynov.com
  role: roles/owner
- members:
  - serviceAccount:service-402564488059@gcp-sa-pubsub.iam.gserviceaccount.com
  role: roles/pubsub.serviceAgent
- condition:
    description: Expire a 21h08 UTC
    expression: request.time < timestamp("2025-11-09T14:08:00Z")
    title: Acces temporaire Cloud Run
  members:
  - user:collaborateur0013@gmail.com
  role: roles/run.admin
- members:
  - serviceAccount:service-402564488059@serverless-robot-prod.iam.gserviceaccount.com
  role: roles/run.serviceAgent
- members:
  - serviceAccount:402564488059@cloudbuild.gserviceaccount.com
  role: roles/storage.admin
- members:
  - user:mederic.marquie@ynov.com
  role: roles/viewer
etag: BwZDKRYBil0=
version: 3
````

On test pour lister les services : 
````
gcloud run services list --region=europe-west1
Listed 0 items.
````

Test avec le collaborateur : 
````
gcloud run deploy run-cloud --image=gcr.io/cloudrun/hello --region=europe-west1 --allow-unauthenticated
Deploying container to Cloud Run service [run-cloud] in project [gpc-tp3] region [europe-west1]
OK Deploying new service... Done.
  OK Creating Revision...
  OK Routing traffic...
  OK Setting IAM Policy...
Done.
Service [run-cloud] revision [run-cloud-00001-lp9] has been deployed and is serving 100 percent of traffic.
Service URL: https://run-cloud-402564488059.europe-west1.run.app
````

### Exercice 8 : 

Changements IAM : 
````
gcloud logging read "protoPayload.methodName=SetIamPolicy" --limit=10 --format=json --project=gpc-tp3
[
  {
    "insertId": "-61dy9cdpcui",
    "logName": "projects/gpc-tp3/logs/cloudaudit.googleapis.com%2Factivity",
    "protoPayload": {
      "@type": "type.googleapis.com/google.cloud.audit.AuditLog",
      "authenticationInfo": {
        "oauthInfo": {
          "oauthClientId": "32555940559.apps.googleusercontent.com"
        },
        "principalEmail": "mederic.marquie@ynov.com",
        "principalSubject": "user:mederic.marquie@ynov.com"
      },
      "authorizationInfo": [
        {
          "granted": true,
          "permission": "resourcemanager.projects.setIamPolicy",
          "permissionType": "ADMIN_WRITE",
          "resource": "projects/gpc-tp3",
          "resourceAttributes": {
            "name": "projects/gpc-tp3",
            "service": "cloudresourcemanager.googleapis.com",
            "type": "cloudresourcemanager.googleapis.com/Project"
          }
        }
      ],
      "methodName": "SetIamPolicy",
      "serviceData": {
        "@type": "type.googleapis.com/google.iam.v1.logging.AuditData",
        "policyDelta": {
          "bindingDeltas": [
            {
              "action": "ADD",
              "condition": {
                "description": "Expire a 21h08 UTC",
                "expression": "request.time < timestamp(\"2025-11-09T21:08:00Z\")",
                "title": "Acces temporaire Cloud Run"
              },
              "member": "user:collaborateur0013@gmail.com",
              "role": "roles/run.admin"
            }
          ]
        }
      },
      "serviceName": "cloudresourcemanager.googleapis.com",
      "status": {},
      "timestamp": "2025-11-09T20:06:41.246951Z"
    },
    "receiveTimestamp": "2025-11-09T20:06:42.980067524Z",
    "resource": {
      "labels": {
        "project_id": "gpc-tp3"
      },
      "type": "project"
    },
    "severity": "NOTICE"
  }
]
````

Actions du collaborateur : 
````
gcloud logging read 'protoPayload.authenticationInfo.principalEmail="collaborateur0013@gmail.com"' --limit=10 --format=json --project=gpc-tp3
[
  {
    "insertId": "pjes3gduu2q",
    "logName": "projects/gpc-tp3/logs/cloudaudit.googleapis.com%2Factivity",
    "protoPayload": {
      "@type": "type.googleapis.com/google.cloud.audit.AuditLog",
      "authenticationInfo": {
        "oauthInfo": {
          "oauthClientId": "32555940559.apps.googleusercontent.com"
        },
        "principalEmail": "collaborateur0013@gmail.com",
        "principalSubject": "user:collaborateur0013@gmail.com"
      },
      "authorizationInfo": [
        {
          "granted": false,
          "permission": "serviceusage.services.enable",
          "permissionType": "ADMIN_WRITE",
          "resource": "projectnumbers/402564488059/services/cloudbuild.googleapis.com",
          "resourceAttributes": {}
        }
      ],
      "methodName": "google.api.serviceusage.v1.ServiceUsage.EnableService",
      "resourceName": "projects/gpc-tp3/services/cloudbuild.googleapis.com",
      "serviceName": "serviceusage.googleapis.com",
      "status": {
        "code": 7,
        "message": "Permission denied to enable service [cloudbuild.googleapis.com]"
      },
      "timestamp": "2025-11-09T19:28:46.301911Z"
    },
    "receiveTimestamp": "2025-11-09T19:28:46.971398790Z",
    "resource": {
      "labels": {
        "method": "google.api.serviceusage.v1.ServiceUsage.EnableService",
        "project_id": "gpc-tp3",
        "service": "serviceusage.googleapis.com"
      },
      "type": "audited_resource"
    },
    "severity": "ERROR"
  },
  {
    "insertId": "abm8umdduet",
    "logName": "projects/gpc-tp3/logs/cloudaudit.googleapis.com%2Factivity",
    "protoPayload": {
      "@type": "type.googleapis.com/google.cloud.audit.AuditLog",
      "authenticationInfo": {
        "oauthInfo": {
          "oauthClientId": "32555940559.apps.googleusercontent.com"
        },
        "principalEmail": "collaborateur0013@gmail.com",
        "principalSubject": "user:collaborateur0013@gmail.com"
      },
      "authorizationInfo": [
        {
          "granted": true,
          "permission": "run.services.delete",
          "permissionType": "ADMIN_WRITE",
          "resource": "namespaces/gpc-tp3/services/hello-test",
          "resourceAttributes": {}
        }
      ],
      "methodName": "google.cloud.run.v1.Services.DeleteService",
      "resourceName": "namespaces/gpc-tp3/services/hello-test",
      "serviceName": "run.googleapis.com",
      "timestamp": "2025-11-09T19:20:31.137517Z"
    },
    "receiveTimestamp": "2025-11-09T19:20:31.531334254Z",
    "resource": {
      "labels": {
        "configuration_name": "",
        "location": "europe-west1",
        "project_id": "gpc-tp3",
        "revision_name": "",
        "service_name": "hello-test"
      },
      "type": "cloud_run_revision"
    },
    "severity": "NOTICE"
  }
]
````
Logs du Cloud RUN  :
````
gcloud logging read "resource.type=cloud_run_revision" --limit=10 --format=json --project=gpc-tp3
[
  {
    "insertId": "rqz153d5hpc",
    "logName": "projects/gpc-tp3/logs/cloudaudit.googleapis.com%2Fsystem_event",
    "protoPayload": {
      "@type": "type.googleapis.com/google.cloud.audit.AuditLog",
      "methodName": "/Services.CreateService",
      "resourceName": "namespaces/gpc-tp3/services/run-cloud",
      "response": {
        "@type": "type.googleapis.com/google.cloud.run.v1.Service",
        "metadata": {
          "annotations": {
            "serving.knative.dev/creator": "mederic.marquie@ynov.com",
            "serving.knative.dev/lastModifier": "mederic.marquie@ynov.com"
          },
          "name": "run-cloud",
          "namespace": "402564488059"
        },
        "status": {
          "url": "https://run-cloud-uwwndjnimq-ew.a.run.app"
        }
      },
      "serviceName": "run.googleapis.com",
      "status": {
        "message": "Ready condition status changed to True for Service run-cloud."
      },
      "timestamp": "2025-11-09T19:55:09.355372Z"
    },
    "receiveTimestamp": "2025-11-09T19:55:09.527792984Z",
    "resource": {
      "labels": {
        "configuration_name": "",
        "location": "europe-west1",
        "project_id": "gpc-tp3",
        "revision_name": "",
        "service_name": "run-cloud"
      },
      "type": "cloud_run_revision"
    },
    "severity": "INFO"
  }
]
````

Puis via les logs : 
````
gcloud logging read 'protoPayload.authenticationInfo.principalEmail="run-backend@gpc-tp3.iam.gserviceaccount.com"' --limit=10 --format=json --project=gpc-tp3
[]
ERROR: (gcloud.logging.read) PERMISSION_DENIED: Permission denied for all log views. This command is authenticated as mederic.marquie@ynov.com which is the active account specified by the [core/account] property
````

Pour finir  : 
````
mederic.marquie@ynov.com - roles/owner
collaborateur0013@gmail.com - roles/editor + customCloudRunDeployer + roles/run.admin (temporaire)
marquie.mederic1@gmail.com - roles/viewer

app-backend@gpc-tp3.iam.gserviceaccount.com
run-backend@gpc-tp3.iam.gserviceaccount.com
deploy-automation@gpc-tp3.iam.gserviceaccount.com

Bucket Storage : gs://gpc-tp3-bucket-cs/
Service Cloud Run : run-backend
Service Cloud Run : run-cloud
Rôle personnalisé : customCloudRunDeployer
````
