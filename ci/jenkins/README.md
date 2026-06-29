# Intégration continue — Jenkins

Ce dossier fournit un environnement **Jenkins prêt à l'emploi** pour exécuter le
pipeline d'intégration continue de FutureKawa (défini dans le [`Jenkinsfile`](../../Jenkinsfile)
à la racine du dépôt) et obtenir une **preuve d'exécution**.

## Ce que fait le pipeline

| Étape | Action |
|---|---|
| Checkout | Récupère le code depuis le dépôt Git |
| Tests — back-end pays | `./mvnw -B test` (16 tests) + publication JUnit |
| Tests — back-end central | `./mvnw -B test` (6 tests) + publication JUnit |
| Tests — front-end | `npm ci` puis `npm test` (Vitest, 9 tests) |
| Packaging | Construit les JAR des back-ends et le build du front |
| Archivage | Publie les artefacts (`*.jar`, `front-end/dist/`) |

L'image Jenkins fournie embarque **JDK 21**, **Node 20**, Git et les plugins
nécessaires ; le job `FutureKawa-CI` est **déjà créé** au démarrage.

## Pré-requis
- Docker Desktop démarré.
- Le `Jenkinsfile` doit être committé sur la branche lue par le job (`sarah`).

## Lancer la démo (pas à pas)

Depuis la racine du dépôt :

```powershell
# 1. Construire l'image Jenkins (la première fois, ~2-3 min)
docker build -t futurekawa-jenkins ci/jenkins

# 2. Démarrer Jenkins (le dépôt est monté en lecture seule sur /repo)
docker run -d --name fk-jenkins -p 18080:8080 `
  -v "C:\Users\ian chel\Documents\GitHub\FutureKawa:/repo:ro" `
  futurekawa-jenkins
```

> Adaptez le chemin du `-v` à l'emplacement du dépôt sur votre machine.

3. Ouvrez **http://localhost:18080** (aucune authentification — assistant désactivé pour la démo).
4. Cliquez sur le job **FutureKawa-CI** → **Lancer un build** (« Build Now »).
5. Suivez la **Stage View** : toutes les étapes passent au vert.
6. Ouvrez **Console Output** pour la preuve détaillée (résultats de tests, `Finished: SUCCESS`).
   → c'est cette page (ou la Stage View verte) que l'on capture en **preuve d'exécution**.

> ⏱️ Le **premier build** télécharge Maven et toutes les dépendances : comptez
> quelques minutes. Les suivants sont bien plus rapides.

## Arrêter et nettoyer

```powershell
docker rm -f fk-jenkins        # arrête et supprime le conteneur Jenkins
# (l'image futurekawa-jenkins reste disponible pour relancer instantanément)
```

## Preuve d'exécution déjà capturée

Un journal complet d'un build réussi est conservé dans
[`docs/ci/preuve-execution-jenkins.txt`](../../docs/ci/preuve-execution-jenkins.txt)
(`22 tests back-end passés, build front OK, Finished: SUCCESS`).

## Notes techniques
- Le job lit le dépôt local monté (`file:///repo`) ; le flag
  `hudson.plugins.git.GitSCM.ALLOW_LOCAL_CHECKOUT` est activé pour cela.
- En contexte réel, on remplacerait `file:///repo` par l'URL du dépôt distant
  (GitHub) et on déclencherait le pipeline via un webhook.
- Le packaging produit des artefacts (JAR + build front). Une évolution possible
  est la construction d'images Docker dans le pipeline (montage du socket Docker).
