#!/bin/sh
npx prisma db push
exec npm start
