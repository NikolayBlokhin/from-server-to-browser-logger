#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys
import json

from twisted.internet import reactor, ssl

from autobahn.twisted.websocket import (
    WebSocketServerProtocol,
    WebSocketServerFactory,
    listenWS,
)

from settings import KEY_PATH_CRT, KEY_PATH_KEY, PORT_FOR_LOGS_SERVER



class LogsServerProtocol(WebSocketServerProtocol):

    def __init__(self):
        super().__init__()

    def onConnect(self, request):
        print('Client connecting: {0}'.format(request.peer))

    def onOpen(self):
        print('WebSocket connection open.')
        self.factory.register(self)

    def onMessage(self, message, isBinary):
        if isBinary:
            print('Binary message received: {0} bytes'.format(len(message)))
        else:
            print('Text message received: {0}'.format(message.decode('utf8')))

        self.sendMessage(message, isBinary)  # echo back message

    def onClose(self, wasClean, code, reason):
        print('WebSocket connection closed: {0}'.format(reason))

    def connectionLost(self, reason):
        WebSocketServerProtocol.connectionLost(self, reason)
        self.factory.unregister(self)


class LogsServerFactory(WebSocketServerFactory):

    def __init__(self, url):
        WebSocketServerFactory.__init__(self, url)
        self.clients = []

    def register(self, client):
        if client not in self.clients:
            print('Registered client {}'.format(client.peer))
            self.clients.append(client)

    def unregister(self, client):
        if client in self.clients:
            print('Unregistered client {}'.format(client.peer))
            self.clients.remove(client)

    def broadcast(self, msg):
        for c in self.clients:
            c.sendMessage(msg.encode('utf8'))
            print('message sent to {}'.format(c.peer))



def runEverySeconds(wss_factory):
    log_message = {
        'message': 'Any message',
    }

    wss_factory.broadcast(json.dumps(log_message))


def main():

    ssl_context = ssl.DefaultOpenSSLContextFactory(
        KEY_PATH_KEY,
        KEY_PATH_CRT
    )

    wss_factory = LogsServerFactory(
        'wss://127.0.0.1:{0}'.format(PORT_FOR_LOGS_SERVER)
    )
    wss_factory.protocol = LogsServerProtocol
    listenWS(wss_factory, ssl_context)


    l = task.LoopingCall(runEverySeconds, wss_factory)
    l.start(3.0)  # call every 3 second

    reactor.run()

if __name__ == '__main__':
    main()


