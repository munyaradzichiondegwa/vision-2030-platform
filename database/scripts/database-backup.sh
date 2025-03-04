# scripts/database-backup.sh
#!/bin/bash
DATE=$(date +%Y%m%d)
mongodump --uri $MONGODB_URI --out ./backups/$DATE