import express = require('express');
import { parseTree, Tree, TaxNode, searchCrit } from 'ncbitaxonomy';
import {logger, setLogLevel} from './logger';
import program = require('commander');
import util = require('util');
import { appendFileSync } from 'fs';

program
  .version('0.1.0')
  .option('-i, --input      [dirPath]', 'Taxonomy dump folder')
  .option('-v, --verbosity [logLevel]', 'Set log level', setLogLevel, 'info')
.parse(process.argv)

if (!program.input)
    throw ('Please provide and input folder');


parseTree(program.input).then((treeObj:Tree) => {
    let app = express();
    // GET method route
    app.get('/', function (req, res) {
        res.send('GET request to the homepage')
    });
    
    // POST method route
    app.post('/', function (req, res) {
        res.send('POST request to the homepage');
    })
    app.get('/get/:taxid', function (req, res) {
        let dataSearch:searchCrit = { id : req.params.taxid };
        logger.debug(`Looking for \"${req.params.taxid}\"`);
        let m:any = treeObj.find(dataSearch);
        logger.debug(`${util.inspect(m, {showHidden: false, depth: null})}`)
        let results:TaxNode[] = treeObj.find(dataSearch);
        logger.debug(JSON.stringify(results));
        res.setHeader('Content-Type', 'application/json');
        res.send( {
            'status' : 'completed', 
            'value'  : results[0]
        });
        return;
    })
    app.get('/find/:regExp', function (req, res) {
        let dataSearch:searchCrit = { name : req.params.regExp };
        logger.debug(`Looking for \"${req.params.regExp}\"`);
        let m:any = treeObj.find(dataSearch);
        logger.debug(`${util.inspect(m, {showHidden: false, depth: null})}`)
        let results:[string, string][] = [];
        treeObj.find(dataSearch).forEach((n)=> {
                results.push([n.nameData[0].taxID, n.nameData[0].name]);
            });
        logger.debug(JSON.stringify(results));
        res.setHeader('Content-Type', 'application/json');
        res.send( {
            'status' : 'completed', 
            'value'  : results
        });
        return;
    })
    app.get('/childof/:child-:parent', function (req, res) {
        logger.debug(`--incoming Request--> ${ util.inspect( req.params, { showHidden: false, depth: null } ) }`);
        

        let childNode:TaxNode[]  = treeObj.find({"id" : req.params.child});
        let parentNode:TaxNode[] = treeObj.find({"id" : req.params.parent});
        
        if (childNode.length == 0) {
            logger.error(`child ID ${req.params.child} not found`);
            res.send( {
                'status' : 'error', 
                'value'  : `child ID ${req.params.child} not found`
            });
            return;
        }
        if (parentNode.length == 0) {
            logger.error(`child ID ${req.params.parent} not found`);
            res.send( {
                'status' : 'error', 
                'value'  : `parent ID ${req.params.parent} not found`
            } );
            return;
        }

        let ans = { 'status' : 'completed',
                'value'  : treeObj.isChildOf(childNode[0], parentNode[0]) 
            }
        logger.debug(`request ${req.params.child}, ${req.params.parent}`
                    + ` => completed::\n${util.inspect(ans, {showHidden: false, depth: null})}`);

        res.send(ans);
    });




    logger.info("Listening");
    app.listen(3000);
});
