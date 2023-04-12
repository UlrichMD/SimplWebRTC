Simple WebRTC implementation with java spring boot

1. Build the docker image using the following command: 
  docker build . --tag simpl_web_rtc
  
2. Start a container with the image:
  docker run --name simpl_web_rtc -p 8080:8080 -t simpl_web_rtc
  
3. Open app in browser:
  localhost:8080