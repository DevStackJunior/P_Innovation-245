# Main Objective :
Prove that 2 financial formated files coming from european format data norm, and swiss format data norm in financial world can be merged and interpreted within one database to display datas, and read/store financial informations within a QR Code.  

## Main Objectives | Technical : 
- Configure database (docker container | private desktop)
- Data Seeds -> DB mysql
- Create 2 raw API routes (1 JSON file/route) 
    - Create 2 JSON files :
      - 1 JSON File | Format Data coming from TWINT (SWISS bank data norm)
      - 1 JSON File | Format Data coming from WERO (EU bank data norm)

### Secoundary Objectives | Technical : 
- Call javascript files (/resources/js/) : 
    - common.js
    - dashboard.js
    - merchant.js
    - pay.js
  within (resources/views/pages/):
    - dashboard.edge
    - merchant.edge
    - pay.edge

🧪 Objectifs du Proof of Concept (PoC)

Ce PoC a pour but de démontrer la faisabilité technique de la fusion de deux applications financières en une seule, à l’aide du framework AdonisJS, en se basant uniquement sur des fichiers JSON bruts comme source de données.

✅ Objectifs principaux

🔄 Fusion des données provenant de deux systèmes/applications financières distincts (App A et App B).

📁 Chargement des données JSON locales (sans base de données ni API externe).

🧱 Architecture modulaire permettant de séparer la logique de chaque application tout en les unifiant dans un seul projet AdonisJS.

🔐 Gestion commune de la logique métier, des services et des routes exposées.

📊 Agrégation, transformation et exposition des données dans un format unifié via une API REST.

⚙️ Structure claire, scalable et extensible, facilitant l’ajout d’une troisième application ou la transition vers une base de données plus tard.

💡 Ce que le PoC démontre
Fonctionnalité	Détail
📂 Lecture multi-source	Chargement de fichiers JSON pour App A et App B
🔄 Fusion logique	Agrégation des données utilisateurs et transactions
🧩 Modularité	Services et contrôleurs organisés par application
🛣️ API REST unifiée	Routes regroupées pour l'accès aux données fusionnées
📈 Simulations réalistes	Exemples de transactions, utilisateurs, agrégation, tri
🔒 Séparation des responsabilités	Gestion distincte des données App A et App B
