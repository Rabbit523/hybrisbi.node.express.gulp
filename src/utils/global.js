var globalVars = [
    {
        name: "permissions",
        source: "/api/session/permissions"
    },
    {
        name: "regions",
        defaultVal: [{
            "region": "APJ"
        }, {
            "region": "EMEA"
        }, {
            "region": "GCR"
        }, {
            "region": "LAC"
        }, {
            "region": "MEE"
        }, {
            "region": "NA"
        }]
    },
    {
        name:"timeZones",
        defaultVal:[
            "UTC-11:00",
            "UTC-10:00",
            "UTC-9:00",
            "UTC-8:00",
            "UTC-7:00",
            "UTC-6:00",
            "UTC-5:00",
            "UTC-4:00",
            "UTC-3:30",
            "UTC-2:00",
            "UTC-1:00",
            "UTC",
            "UTC+1:00",
            "UTC+2:00",
            "UTC+3:00",
            "UTC+3:30",
            "UTC+4:00",
            "UTC+5:00",
            "UTC+5:30",
            "UTC+6:00",
            "UTC+7:00",
            "UTC+8:00",
            "UTC+9:00",
            "UTC+9:30",
            "UTC+10:00",
            "UTC+11:00",
            "UTC+12:00"
        ]
    },
    {
        name: "permissionsStatuses",
        defaultVal: [
            "In Process",
            "Granted",
            "Rejected"
        ]
    },
    {
        name: "userTypes",
        defaultVal: ['PSE', 'PIE', 'CE', 'PS', 'EM']
    },
    {
        name: "employeeTypes",
        defaultVal: [{
            "employeeType": 'I'
        }, {
            "employeeType": 'C'
        }, {
            "employeeType": 'O'
        }]
    },
    {
        name: "roles",
        defaultVal: [{
            "role": "TAM"
        }, {
            "role": "PM"
        },{
            "role": "CM"
        },{
            "role": "PM/TAM"
        }, {
            "role": "PS"
        }, {
            "role": "CM"
        }, {
            "role": "PSE"
        }, {
            "role": "SOC/NOC"
        }, {
            "role": "Esc. Manager"
        }, {
            "role": "PS Manager",
        }, {
            "role": "PM Manager",
        }, {
            "role": "TAM Manager",
        }, {
            "role": "SOC/NOC Manager"
        }, {
            "role": "Administrator"
        }, {
            "role": "Report",
        }, {
            "role": "Not Applicable"
        }]
    },
    {
        name: "editions",
        defaultVal: [{
            "edition": "Hybris Hosting"
        }, {
            "edition": "Edge"
        }, {
            "edition": "PPV"
        }, {
            "edition": "Cores Standard"
        }, {
            "edition": "Cores Professional"
        }, {
            "edition": "Cores Enterprise"
        }, {
            "edition": "Revenue Standard"
        }, {
            "edition": "Revenue Professional"
        }, {
            "edition": "Revenue Enterprise"
        }, {
            "edition": ""
        }]
    },
    {
        name: "subRoles",
        defaultVal: [{
            "subRole": "Senior TAM"
        }, {
            "subRole": "Senior PM"
        }, {
            "subRole": "Senior PS"
        }]
    },
    {
        name: "me",
        source: "/api/session/me"
    },
    {
        name: "users",
        source: "/api/users/getUsers"
    },
    {
        name: "customerCodes",
        defaultVal: [],
        source: "/api/customers/getCodes",
        dataHandler: function (data) {
            return $.map(data.tables, function (value) {
                return value.VAL;
            });
        }
    },
    {
        name: "hybrisVersion",
        defaultVal: [],
        source: "/api/versions/getVersions"
    },
    {
        name: "escalationManagers",
        defaultVal: [],
        source: "/api/users/getUsers?role=Esc. Manager",
        dataHandler: function (data) {
            return data.map(function (value, index) {
                return {
                    id: value.EMPLOYEE_ID,
                    name: value.USER_NAME,
                    role: value.ROLE
                };
            });
        }
    }
];

function globalVariables() {
    return globalVars;
}