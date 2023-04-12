package com.ulrcihm.simplWebRTC;

import javax.websocket.EncodeException;
import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

import java.util.List;
import java.io.IOException;
import java.util.ArrayList;
import org.springframework.stereotype.Component;

@Component
@ServerEndpoint(value = "/webSocket")
public class SignalServer {
	
	private static final List<Session> sessions = new ArrayList<Session>();
	
	//open connection to websocket
	@OnOpen
    public void openConnection(Session session) throws IOException, EncodeException {
		System.out.println("Open connection");
        sessions.add(session);
    }
	
	//process inbound messages
	@OnMessage
	public void handleMessage(String data, Session session) throws IOException {
		System.out.println("receive message: "+ data);
		for (Session sess : sessions) {
            if (!sess.equals(session)) {
                sess.getBasicRemote().sendText(data);
            }
        }
	}
	
	//close connection to websocket
	@OnClose
    public void closeConnection(Session session) {
        System.out.println("Close!");
        sessions.remove(session);
    }
    @OnError
    public void onError(Session session, Throwable throwable) {
        //Error
    }
}
