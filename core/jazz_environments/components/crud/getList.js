// =========================================================================
// Copyright © 2017 T-Mobile USA, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// =========================================================================

/**
    Get List of Environment-Catalogs
    @module: getList.js
    @description: CRUD functions for Environment catalog
    @author:
    @version: 1.0
 **/

const utils = require("../utils.js")(); //Import the utils module.
const logger = require("../logger.js"); //Import the logging module.

module.exports = (tableName, query, indexName, onComplete) => {
    // initialize dynamodb
    var docClient = utils.initDocClient();
    var filter = "";
    var insertAndString = " AND ";

    var params = {
        TableName: tableName,
        IndexName: indexName,
        KeyConditionExpression: "SERVICE_DOMAIN = :SERVICE_DOMAIN and SERVICE_NAME  = :SERVICE_NAME",
        ExpressionAttributeValues: {
            ":SERVICE_NAME": query.service,
            ":SERVICE_DOMAIN": query.domain
        }
    };

    if (query) {
        var keys_list = global.config.service_environment_filter_params;

        // Generate filter string
        keys_list.forEach(function (key) {
            var key_name = utils.getEnvironmentDatabaseKeyName(key);

            if (query[key] && key_name !== "SERVICE_DOMAIN" && key_name !== "SERVICE_NAME") {
                filter = filter + key_name + " = :" + key_name + insertAndString;
                params.ExpressionAttributeValues[":" + key_name] = query[key]
            }
        });
    }

    filter = filter.substring(0, filter.length - insertAndString.length); // remove the " AND " at the end

    if (filter) {
        params.FilterExpression = filter;
    }

    var items_formatted = [];
    var queryExecute = function (onComplete) {
        docClient.query(params, function (err, items) {
            var count;
            if (err) {
                onComplete(err);
            } else {
                items.Items.forEach(function (item) {
                    items_formatted.push(utils.formatEnvironment(item));
                });

                if (items.LastEvaluatedKey) {
                    params.ExclusiveStartKey = items.LastEvaluatedKey;
                    queryExecute(onComplete);
                } else {
                    var obj = {
                        count: items_formatted.length,
                        environment: items_formatted
                    };
                    onComplete(null, obj);
                }
            }
        });
    }
    queryExecute(onComplete);
};