# scripts/run-migrations.sh
#!/bin/bash
for file in database/migrations/*.js; do
  echo "Running migration: $file"
  mongo vision2030 --eval "$(cat $file)"
done