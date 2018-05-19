# FILES=./wrapper-array/*
# for f in $FILES
# do

# 	#   sed -i -e 's/# `/## /g' $f && sed -i -e 's/)`/)/g' $f
#     # rm "$f"
# done

for file in ./wrapper/*.md-e
do
  rm $file
done