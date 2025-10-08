## Main Objectives : 
Prove that 2 financial formated files coming from european format data norm, and swiss format data norm in financial world can be merged and interpreted within one database to display datas, and read/store financial informations within a QR Code.  
- Configure database (docker container | private desktop)
- Data Seeds -> DB mysql
- Create 2 raw API routes (1 JSON file/route) 
    - Create 2 JSON files :
      - 1 JSON File | Format Data coming from TWINT (SWISS bank data norm)
      - 1 JSON File | Format Data coming from WERO (EU bank data norm)

### Secoundary Objectives : 
- Call javascript files (/resources/js/) : 
    - common.js
    - dashboard.js
    - merchant.js
    - pay.js
  within (resources/views/pages/):
    - dashboard.edge
    - merchant.edge
    - pay.edge

