# Projet_GL02
Repo principal pour notre projet GL02, de gestion d'emploi du temps de salle de travail en université.

# Execution
Pour exécuter le programme, utilisez les commandes suivantes depuis la racine du projet (Projet_GL02) :

il faut être dans le dossier parseur pour initialiser.
```bash
cd Parseur
```

Verifier que npm est installé et a jour : 
```bash
npm install
```

Ensuite pour lancer notre application :
```bash
node caporalCli.js start
```

Ensuite pour parser :
```bash
parseFile valideEdt.cru
```

Nous pouvons par la suite utiliser des fonctions qui concernent les fonctions des spécifications: 
```bash
help
capaciteMax
sallesCours
dispoSalle
sallesDispo
classementCapacite
occupation
icalendar
parseFile
showData
exit
```
# Jasmine 
Concernant l'utilisation des tests unitaires de Jasmine, il se font aussi dans le dossier Paurseur


# Commands 
## capaciteMax
info: Description : Renvoie la capacité maximale pour une salle.
 Au moins un fichier .cru contenant la salle nécessaire pour rechercher une salle.


## sallesCours
info: Description : Donne les salles pour un cours donné. 
Exemple d'utilisation : sallesCours LE02
Au moins un fichier contenant la classe pour renvoyer les résultats.



## dispoSalle
info: Description : Renvoie tous les moments où la salle est inoccupée.
 Usage : dispoSalle ROOM_ID arg1 arg2
 optionels arguments :
 arg1 : start hour (H:MM) | arg2 : end hour (H:MM)


## sallesDispo
info: Description : Renvoie toutes les salles inoccupées pour un moment donné.
 Usage : sallesDispo ROOM_ID arg1 arg2 arg3
 arguments : arg1 : Day (M,MA,ME,J,V,S,D)
 arg2 : Start time (H:MM)
 arg3 : End time (H:MM)


## classementCapacite
info: Description : Affiche toutes les salles classées par capacité (ordre décroissant). Aucun argument nécessaire.


## occupation
info: Description : Affiche un graphique montrant combien chaque salle est utilisée durant la semaine. Aucun argument nécessaire.        



## icalendar
info: Description : Génère un fichier iCalendar (.ics) pour les Unités d’Enseignement (UE) sélectionnées sur une plage de dates spécifiée.
 Usage: icalendar  AAAA-MM-JJ AAAA-MM-JJ UE1 UE2 [...] output.ics
 La première date à rentrer est la date de début et la seconde la date de fin.
 Option: output.ics est le nom du fichier que l'on va générer après execution <filename> to set the custom output filename. output est un nom générique, vous pouvez écrire ce que vous voulez à la place de output, ex: nvcalendar.ics



## parseFile
info: Description : Analyse le fichier donné, s’il ne contient aucune erreur.
 Usage : parseFile PATH_TO_FILE
 Example usage : parseFile ./edt.cru


## exit
info: Description : Quitte l'application. Aucun argument nécessaire


## showData
info: Description : Affiche toutes les données actuellement analysées. Aucun argument nécessaire
