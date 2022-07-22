
docker rm -f $(docker ps -aq)

docker network prune -f

docker volume prune -f

docker network create --attachable --driver overlay artifacts_test

pushd create-certificate-with-ca/
docker-compose up -d
popd
docker-compose up -d

sudo docker run --volume=/:/rootfs:ro --volume=/var/run:/var/run:rw --volume=/sys/fs/cgroup:/sys/fs/cgroup:ro --volume=/var/lib/docker/:/var/lib/docker:ro --publish=8008:8080 --detach=true --name=cadvisor --privileged=true google/cadvisor:latest
