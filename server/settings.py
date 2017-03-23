#!/usr/bin/env python3
# -*- coding: utf-8 -*-

KEY_PATH_CRT = '/path/to/file'
KEY_PATH_KEY = '/path/to/file'

PORT_FOR_LOGS_SERVER = 8000


try:
    from local_settings import *
except ImportError:
    print('WARNING: There is no local_settings.py!')
