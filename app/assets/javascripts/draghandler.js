/* BSD3-style license for fixup code from tool-man.org
   we use capturing events where possible for maximum browser beatdown potential :)

Copyright (c) 2005 Tim Taylor Consulting <http://tool-man.org/>

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the "Software"),
to deal in the Software without restriction, including without limitation
the rights to use, copy, modify, merge, publish, distribute, sublicense,
and/or sell copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
*/

fixupEvent = function(event)
{
    if(!event) event = window.event;

    return event;
}

fixupAddListener = function(element, type, func)
{
    if (element.addEventListener) {
         element.addEventListener(type, func, true)
    } else if (element.attachEvent) {
        if (!element._listeners) element._listeners = new Array()
        if (!element._listeners[type]) element._listeners[type] = new Array()
        var workaroundFunc = function() {
            func.apply(element, new Array())
        }
        element._listeners[type][func] = workaroundFunc
        element.attachEvent('on' + type, workaroundFunc)
    }
}

fixupRemoveListener = function(element, type, func)
{
    if (element.removeEventListener) {
        element.removeEventListener(type, func, true)
    } else if (element.detachEvent) {
        if (element._listeners
            && element._listeners[type]
            && element._listeners[type][func])
        {
            element.detachEvent('on' + type, element._listeners[type][func])
        }
    }
}

DragHandler = function(id, handleFunction)
{
    this.handler = handleFunction;
    this.element = document.getElementById(id);
    
    this.mouseDownDelegate = mkDelegate(this, this.handleMouseDown);
    this.mouseMoveDelegate = mkDelegate(this, this.handleMouseMove);
    this.mouseUpDelegate = mkDelegate(this, this.handleMouseUp);
    
    this.element.onmousedown = this.mouseDownDelegate;
}

DragHandler.prototype = 
{
    dragThreshold:5,
    handler:undefined,
    element:undefined,

    isDragging:false,
    eventsRegistered:false,
    startX:0,
    startY:0,
    endX:0,
    endY:0,
    
    handleMouseDown:function(event)
    {
        event = fixupEvent(event);
        
        this.startX = event.clientX;
        this.startY = event.clientY;

        this.isDragging = false;

        if(!this.eventsRegistered)
        {
            fixupAddListener(document, 'mousemove', this.mouseMoveDelegate);
            fixupAddListener(document, 'mouseup', this.mouseUpDelegate);
            this.eventsRegistered = true;
        }
        
        return false;
    },
    
    handleMouseUp:function(event)
    {
        if(this.eventsRegistered)
        {
            fixupRemoveListener(document, 'mousemove', this.mouseMoveDelegate);
            fixupRemoveListener(document, 'mouseup', this.mouseUpDelegate);
            this.eventsRegistered = false;
        }

        event = fixupEvent(event);
        
        this.endX = event.clientX;
        this.endY = event.clientY;

        if(this.isDragging)
        {
            this.handler(this.startX, this.startY, this.endX, this.endY);            
        }

        this.isDragging = false;
        
        return false;
    },
    
    handleMouseMove:function(event)
    {
        event = fixupEvent(event);
        var newX = event.clientX;
        var newY = event.clientY;
        
        if (this.isDragging 
            || (Math.abs(newX - this.startX) + Math.abs(newY - this.startY) > this.dragThreshold))
        {
            this.handler(this.startX, this.startY, newX, newY);
            
            this.startX = newX;
            this.startY = newY;
            this.isDragging = true;
        }
        
        return false;
    },
    
    handleMouseOut:function(event)
    {
        //event = fixupEvent(event);
    }
}
