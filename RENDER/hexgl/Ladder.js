 /*
 * HexGL
 * @author Thibaut 'RENDER' Despoulain <http://RENDER.com>
 * @license This work is licensed under the Creative Commons Attribution-NonCommercial 3.0 Unported License. 
 *          To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/3.0/.
 */

var RENDER = RENDER || {};
RENDER.hexgl = RENDER.hexgl || {};

RENDER.hexgl.Ladder = {};
RENDER.hexgl.Ladder.global = {};

RENDER.hexgl.Ladder.load = function(callback)
{
	var s = encodeURIComponent(window.location.href);
	RENDER.Utils.request("nothing", false, function(req)
	{
		try {
			RENDER.Ladder.global = JSON.parse(req.responseText);
			if(callback) callback.call(window);
		}
		catch(e)
		{
			console.warn('Unable to load ladder. '+e);
		}
	},
	{
		u: s
	});
}

RENDER.hexgl.Ladder.displayLadder = function(id, track, mode, num)
{
	var d = document.getElementById(id);
	if(d == undefined || RENDER.Ladder.global[track] == undefined || !RENDER.Ladder.global[track][mode] == undefined)
	{
		console.warn('Undefined ladder.');
		return;
	}

	var l = RENDER.Ladder.global[track][mode];
	var h = '';
	var m = Math.min((num == undefined ? 10 : num), l.length-1);
	for(var i = 0; i < l.length-1; i++)
	{
		var t = RENDER.Timer.msToTime(l[i]['score']);
		h += '<span class="ladder-row"><b>'+(i+1)+'. '+l[i]['name']+'</b><i>'+t.m+'\''+t.s+'\'\''+t.ms+'</i></span>';
	}

	d.innerHTML = h;
}