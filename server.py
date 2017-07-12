#!/usr/bin/env python
from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer
import SocketServer
import random, string
import cgi
import os
from PIL import Image
import re
import json

os.environ['TF_CPP_MIN_LOG_LEVEL']='2'

def randomword(length):
    return ''.join(random.choice(string.lowercase) for i in range(length))

class S(BaseHTTPRequestHandler):

    def _set_headers(self,filetype):
        print filetype
        self.send_response(200)
        if filetype == "css":
            self.send_header('Content-type', 'text/css')
        if filetype == "html":
            self.send_header('Content-type', 'text/html')
        self.end_headers()

    def do_GET(self):
        p = self.path.split("?")
        path = p[0]
        print path
        if path == "/":
            path = "/index.html"
        self._set_headers(path.split(".")[-1])
        f = open("."+path, "r")
        self.wfile.write(f.read())

    def do_HEAD(self):
        self._set_headers()

    def do_POST(self):
        op_id=randomword(10)
        print "["+op_id+"] Starting operation"

def run(server_class=HTTPServer, handler_class=S, port=80):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print 'Starting httpd...'
    httpd.serve_forever()

if __name__ == "__main__":
    from sys import argv

if len(argv) == 2:
    run(port=int(argv[1]))
else:
    run(port=80)
