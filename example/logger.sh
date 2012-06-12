#! /bin/sh

 {
while [ 1 ]; do

	echo "mark!! $(date)";
	sleep 1
	echo "mark!! $(date)";
	echo ""
	sleep 1

done
} > ./test.log
