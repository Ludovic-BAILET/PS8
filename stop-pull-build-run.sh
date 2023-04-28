# Description: Stop, push, build, and run the docker container

# We go to the directory of the project
echo "------------------ We go to the directory of the project ------------------"
cd ~/ps8-2023-puissance-2/

# We stop the container
echo "-------------------------- We stop the container --------------------------"
docker stop $(docker ps -a -f "name=ps8-2023-puissance-2-nodeJs-1" -q)

# We delete the image docker
echo "-------------------------- We delete the image docker --------------------------"
yes | docker image prune

# We pull from the git repository
echo "--------------------- We pull from the git repository ---------------------"
git pull

# We build the docker image
echo "------------------------ We build the docker image ------------------------"
docker build -t name:nodeJs .

# We run the docker container
echo "----------------------- We run the docker container -----------------------"
docker-compose up

# We display the docker container
#echo "--------------------- We display the docker container ---------------------"
#docker ps
