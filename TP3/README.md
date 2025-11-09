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


