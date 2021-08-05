from json.encoder import JSONEncoder
import os
from os import error
import requests
import datetime
import json
from colorama import Fore
from decouple import config

http_session = requests.session()

# Setting URL to Call
url = 'https://stundenplan.hamburg.de/WebUntis/jsonrpc.do?school=' + config('SCHOOL')

# Define Headers
headers = {
    'User-Agent': 'WebUntis Test',
    'Content-Type': 'application/json'
}

# Start Authentication #

def auth(user, password):

    try:

        data = {
            'id': str(datetime.datetime.today()),
            'method': 'authenticate',
            'params':
            {
                'user': user,
                'password': password,
                'client': 'WebUntis Test'
            },
            'jsonrpc': '2.0'
        }

        authenticate = http_session.post(url, data=json.dumps(data), headers=headers)
        print(Fore.CYAN + 'Authentication ' + Fore.RESET + '→ Connection established to: ' + url)

    except (Exception, ArithmeticError) as e:
        template = Fore.LIGHTRED_EX + 'Error ' + Fore.RESET + '→ An exception of type' + Fore.LIGHTBLUE_EX + ' {0} ' + Fore.RESET + 'occurred.' + Fore.LIGHTBLACK_EX + ' {1!r}'
        message = template.format(type(e).__name__, e.args)
        print (message)

# End Authentication #

# Start Request #

def apiCall(method, filename, parameters):

    # Try to Execute API Call
    try:

        # Parameter Handler
        if (parameters == None):
            data = {'id': str(datetime.datetime.today()), 'method': method, 'params': {}, 'jsonrpc': '2.0'}
        else:
            data = {'id': str(datetime.datetime.today()), 'method': method, 'params': parameters, 'jsonrpc': '2.0'}

        # API Call
        request = http_session.post(url, data=json.dumps(data), headers=headers)

        if 'no allowed date' in request.text:
            print(Fore.LIGHTRED_EX + 'Error ' + Fore.RESET + '→ An exception has occured (' + filename + '.json) ' + Fore.LIGHTRED_EX + 'Timespan not allowed')
            return

        elif 'Method not found' in request.text:
            print(Fore.LIGHTRED_EX + 'Error ' + Fore.RESET + '→ An exception has occured (' + filename + '.json) ' + Fore.LIGHTRED_EX + 'Invalid method')
            return  
        
        elif 'error' in request.text:
            print(Fore.LIGHTRED_EX + 'Error ' + Fore.RESET + '→ An exception has occured (' + filename + '.json) ' + Fore.LIGHTBLACK_EX + request.text)
            return

        # Create File
        with open('api/' + filename + '.json', 'w') as write_file:
            json.dump(json.loads(request.text), write_file, indent=4)

        # Complete API Call
        print(Fore.GREEN + 'Success ' + Fore.RESET + '→ Created File: ' + filename + '.json')

    # Catch Error
    except (Exception, ArithmeticError) as e:
        template = Fore.LIGHTRED_EX + 'Error ' + Fore.RESET + '→ An exception of type' + Fore.LIGHTBLUE_EX + ' {0} ' + Fore.RESET + 'occurred.' + Fore.LIGHTBLACK_EX + ' {1!r}'
        message = template.format(type(e).__name__, e.args)
        print (message)

# End Request #

# Start Logout #

def logout():

    try:

        data = {
            'id': str(datetime.datetime.today()),
            'method': 'logout',
            'params':{},
            'jsonrpc': '2.0'
        }
        print(Fore.CYAN + 'Authentication ' + Fore.RESET + '→ Connection closed')

    except (Exception, ArithmeticError) as e:
        template = Fore.LIGHTRED_EX + 'Error ' + Fore.RESET + '→ An exception of type' + Fore.LIGHTBLUE_EX + ' {0} ' + Fore.RESET + 'occurred.' + Fore.LIGHTBLACK_EX + ' {1!r}'
        message = template.format(type(e).__name__, e.args)
        print (message)

# End Logout #


# Authenticate and set User and Password (School can be changed in .env file)
auth(config('USER'), config('PASSWORD'))

# API Requests
apiCall('getKlassen', 'classes', None)
apiCall('getSubjects', 'subjects', None)
apiCall('getRooms', 'rooms', None)
apiCall('getTimegridUnits', 'timegrid', None)
apiCall('getStatusData', 'status', None)
apiCall('getCurrentSchoolyear', 'current-schoolyear', None)
apiCall('getSchoolyears', 'all-schoolyears', None)
apiCall('getTimetable', 'timetable-specific', {"id":8,"type":1,"startDate": 20210805, "endDate": 20210808})

logout()