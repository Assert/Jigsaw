
function jigsaw(canvasID, animal, rows, columns) {
    
    this.MODE = "EASY"; //HARD

    this.background_image = document.getElementById("backgrond");

    if(animal=="pig"){
        this.puzzlePicture = document.getElementById("pig");
        this.puzzlePictureShadow = document.getElementById("pigShadow");
    }else if(animal=="sheep"){
        this.puzzlePicture = document.getElementById("sheep");
        this.puzzlePictureShadow = document.getElementById("sheepShadow");
    }else if(animal=="duck"){
        this.puzzlePicture = document.getElementById("duck");
        this.puzzlePictureShadow = document.getElementById("duckShadow");
    }else if(animal=="donkey"){
        this.puzzlePicture = document.getElementById("donkey");
        this.puzzlePictureShadow = document.getElementById("donkeyShadow");
    }else{
        alert("Dev-exception: Error in animal string (jigsawScript.js)");            
    }

    // Org size of image
    this.ORG_PUZZLE_WIDTH = this.puzzlePicture.naturalWidth -1;
    this.ORG_PUZZLE_HEIGHT = this.puzzlePicture.naturalHeight -1;

    // Zoom image to
    this.SHOW_PUZZLE_WIDTH = 600;
    this.SHOW_PUZZLE_HEIGHT = 450;
    
    // Grid to
    this.TOTAL_ROWS = rows;
    this.TOTAL_COLUMNS = columns; 
    this.TOTAL_PIECES = this.TOTAL_ROWS * this.TOTAL_COLUMNS;

    // Size of the pieces
    this.PIECES_WIDTH = Math.round(this.ORG_PUZZLE_WIDTH / this.TOTAL_COLUMNS);
    this.PIECES_HEIGHT = Math.round(this.ORG_PUZZLE_HEIGHT / this.TOTAL_ROWS);

    this.BLOCK_WIDTH = Math.round(this.SHOW_PUZZLE_WIDTH / this.TOTAL_COLUMNS);
    this.BLOCK_HEIGHT = Math.round(this.SHOW_PUZZLE_HEIGHT / this.TOTAL_ROWS);
    
    // Selected piece offset from mouse point
    // Ikke sikker på hva denne gjør lenger
    this.offsetX = 200;
    this.offsetY = 200;

    // Set jugsaw to middle
    this.PUZZLE_PADDING_TOP = 150;
    this.PUZZLE_PADDING_LEFT = 200;

    this.canvasID = canvasID;

    this.top = this.PUZZLE_PADDING_TOP;
    this.left = this.PUZZLE_PADDING_LEFT;

    this.pieceList = [];
    this.slotList = [];
    this.selectedPiece = null;
    
    this.canvas = document.getElementById(this.canvasID);
    this.ctx = this.canvas.getContext('2d');

    var mySelf;
    this.initDrawing = function () {
        mySelf = this; // eventene har annet "this" og må bruke denne

        // register events
        this.canvas.onmousedown = this.handleOnMouseDown;
        this.canvas.onmouseup = this.handleOnMouseUp;
        this.canvas.onmousemove = this.handleOnMouseMove;
        
        this.canvas.addEventListener("touchstart", this.handleOnMouseDown, false);
        this.canvas.addEventListener("touchend", this.handleOnMouseUp, false);
        this.canvas.addEventListener("touchmove", this.handleOnMouseMove, false);
   
        this.initializeNewGame();
    };
    
    this.initializeNewGame = function() {
        this.pieceList = [];
        this.slotList = [];
        
        this.devideBoardIntoPieces();
        this.redrawGame();
    };

    this.devideBoardIntoPieces = function() {
        
 
        for (var i = 0; i < this.TOTAL_PIECES; i++) {       
            var imgBlock = this.makePuzzlePiece(i);
            this.pieceList.push(imgBlock);

            var block = this.makeBoardBlock(i);
            this.slotList.push(block);
        }
    };
    
    
    // Game is redrawn on every movement
    // If we could XOR the moved piece that would be faster.
    this.redrawGame = function() {
        mySelf.clearCanvas();
        mySelf.drawLines();
        mySelf.drawNonSelectedPieces();

        if (this.selectedPiece) {
            // Draw selected block while it is moving
            mySelf.drawImageBlock(this.selectedPiece);
        }
    };

    this.drawLines = function() {
        // Draw background image
        this.ctx.drawImage(this.background_image, 0, 0);

        // Draw preview image
        this.ctx.drawImage(this.puzzlePictureShadow, 0, 0, this.ORG_PUZZLE_WIDTH, this.ORG_PUZZLE_HEIGHT, this.PUZZLE_PADDING_LEFT, this.PUZZLE_PADDING_TOP, this.SHOW_PUZZLE_WIDTH, this.SHOW_PUZZLE_HEIGHT);
       
        this.ctx.strokeStyle = "#000000"; 
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        
        // draw verticle lines
        for (var i = 0; i <= this.TOTAL_COLUMNS; i++) {
            var x = this.PUZZLE_PADDING_LEFT + (this.BLOCK_WIDTH * i);
            this.ctx.moveTo(x, this.PUZZLE_PADDING_TOP);
            this.ctx.lineTo(x, 450+this.PUZZLE_PADDING_TOP);
        }

        // draw horizontal lines
        for (i = 0; i <= this.TOTAL_ROWS; i++) {
            var y = this.PUZZLE_PADDING_TOP + (this.BLOCK_HEIGHT * i);
            this.ctx.moveTo(this.PUZZLE_PADDING_LEFT, y);
            this.ctx.lineTo(600+this.PUZZLE_PADDING_LEFT, y);
        }

        this.ctx.closePath();
        this.ctx.stroke();
    };

    this.drawNonSelectedPieces = function() {
        for (var i = 0; i < this.pieceList.length; i++) {
            var imgBlock = this.pieceList[i];
            if (imgBlock.isSelected === false) {
                this.drawImageBlock(imgBlock);
            }
        }
    };

    this.drawImageBlock = function(imgBlock) {
        this.drawFinalImage(imgBlock.no, imgBlock.x, imgBlock.y, this.BLOCK_WIDTH, this.BLOCK_HEIGHT);
    };

    this.drawFinalImage = function(index, destX, destY, destWidth, destHeight) {
        this.ctx.save();
        var srcX = (index % this.TOTAL_COLUMNS) * this.PIECES_WIDTH;
        var srcY = Math.floor(index / this.TOTAL_COLUMNS) * this.PIECES_HEIGHT;
        this.ctx.drawImage(this.puzzlePicture, srcX, srcY, this.PIECES_WIDTH, this.PIECES_HEIGHT, destX, destY, destWidth, destHeight);
        this.ctx.restore();
    };

    var interval = null;
    var remove_width;
    var remove_height;
    
    this.OnFinished = function() {

        intel.xdk.player.startAudio("Audio/finish.mp3",false);
        
        remove_width = this.BLOCK_WIDTH;
        remove_height = this.BLOCK_HEIGHT;

        interval = setInterval(function () { mySelf.endGame(); }, 100);
        
        // Raise event "eventGameEnded()"
    };

    this.endGame = function () {
        remove_width -= 30;
        remove_height -= 20;

        if (remove_width > 0 && remove_height > 0) {

            mySelf.clearCanvas();
            for (var i = 0; i < this.pieceList.length; i++) {
                var imgBlock = this.pieceList[i];

                imgBlock.x += 10;
                imgBlock.y += 10;

                mySelf.drawFinalImage(imgBlock.no, imgBlock.x, imgBlock.y, remove_width, remove_height);
            }

        } else {

            clearInterval(interval);
           
            // Restart game
            this.initializeNewGame(); 
        }
    };

    this.handleOnMouseDown = function(e) {
        e.preventDefault();//Stops the default behavior
        // remove old selected
        if (mySelf.selectedPiece !== null) {
            mySelf.pieceList[mySelf.selectedPiece.no].isSelected = false;
        }

        mySelf.selectedPiece = mySelf.FindSelectedPuzzlePiece(mySelf.pieceList, e.pageX, e.pageY);
        
        if (mySelf.selectedPiece) {
            mySelf.pieceList[mySelf.selectedPiece.no].isSelected = true;
                  mySelf.offsetX = e.pageX - mySelf.selectedPiece.x;
                  mySelf.offsetY = e.pageY - mySelf.selectedPiece.y;
        }
    };

    this.handleOnMouseUp = function(e) {  
        //In hard mode blocks will snapp to any slot, in easy they will not
        if (mySelf.selectedPiece) {
            var index = mySelf.selectedPiece.no;
      
            if(this.MODE=="HARD"){
                //Trenger jeg dette i HARD MODE?
                var block = mySelf.FindSelectedPuzzlePiece(mySelf.slotList, mySelf.selectedPiece.x, mySelf.selectedPiece.y);
                if (block) {
                    var blockOldImage = mySelf.GetImageBlockOnEqual(mySelf.pieceList, block.x, block.y);
                    if (blockOldImage === null) {
                        mySelf.pieceList[index].x = block.x;
                        mySelf.pieceList[index].y = block.y;
                    }
                }
                else {
                    mySelf.pieceList[index].x = mySelf.selectedPiece.x;
                    mySelf.pieceList[index].y = mySelf.selectedPiece.y;
                }
            }else{
                mySelf.pieceList[index].x = mySelf.selectedPiece.x;
                mySelf.pieceList[index].y = mySelf.selectedPiece.y;        
            }
        
            mySelf.pieceList[index].isSelected = false;
            mySelf.selectedPiece = null;
            mySelf.redrawGame();

            if (mySelf.isFinished()) {
                mySelf.OnFinished();
            }
        }
    };

    this.handleOnMouseMove = function(e) {

        // Denne fyrer hele tiden..
        
        e.preventDefault();//Stops the default behavior
        if (mySelf.selectedPiece) {
           var index = mySelf.selectedPiece.no;
            var block = mySelf.FindSelectedPuzzlePiece(mySelf.slotList, e.pageX, e.pageY);
            if(block){
                if(index==block.no && mySelf.MODE!="HARD"){
                    mySelf.pieceList[index].x = block.x;
                    mySelf.pieceList[index].y = block.y;

                      mySelf.pieceList[index].isSelected = false;
                        mySelf.selectedPiece = null;
                        mySelf.redrawGame();
                         if (mySelf.isFinished()) {
                             mySelf.OnFinished();
                       }
                }else{
                    //Move
                    mySelf.selectedPiece.x = e.pageX - mySelf.offsetX;
                    mySelf.selectedPiece.y = e.pageY - mySelf.offsetY;
                    mySelf.redrawGame();         
                }
            }else{
                //Move
                mySelf.selectedPiece.x = e.pageX - mySelf.offsetX;
                mySelf.selectedPiece.y = e.pageY - mySelf.offsetY;

                mySelf.redrawGame();                
            }
        }
    };

    this.clearCanvas = function() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };

    this.makePuzzlePiece = function(index) {
            var randValX = (Math.random() * 1024);
            if (randValX>(1024-this.BLOCK_WIDTH)) randValX=1024-this.BLOCK_WIDTH;
        
            randValX = Math.round(randValX);
    
            var randValY;
             if (yesNo()){
                randValY=10;
            }else{
                randValY=730 - this.BLOCK_HEIGHT;
            }
        return new puzzleBlock(index, randValX, randValY);
    };

    this.makeBoardBlock = function(index) {
        var x = this.PUZZLE_PADDING_LEFT + (index % this.TOTAL_COLUMNS) * this.BLOCK_WIDTH;
        var y = this.PUZZLE_PADDING_TOP + Math.floor(index / this.TOTAL_COLUMNS) * this.BLOCK_HEIGHT;

        return new puzzleBlock(index, x, y);        
    };
    
    this.FindSelectedPuzzlePiece = function(list, x, y) {        
        for (var i = list.length - 1; i >= 0; i--) {
            var imgBlock = list[i];

            var x1 = imgBlock.x;
            var x2 = x1 + this.BLOCK_WIDTH;

            var y1 = imgBlock.y;
            var y2 = y1 + this.BLOCK_HEIGHT;

            if ((x >= x1 && x <= x2) && (y >= y1 && y <= y2)) {
                return new puzzleBlock(imgBlock.no, imgBlock.x, imgBlock.y);
            }
        }
        return null;
    };

    this.GetImageBlockOnEqual = function(list, x, y) {
        for (var i = 0; i < list.length; i++) {
            var imgBlock = list[i];

            var x1 = imgBlock.x;
            var y1 = imgBlock.y;
            if ((x == x1) && (y == y1)) {
                return new puzzleBlock(imgBlock.no, imgBlock.x, imgBlock.y);
            }
        }
        return null;
    };

    this.isFinished = function() {
        var total = this.TOTAL_PIECES;
        for (var i = 0; i < total; i++) {
            var img = this.pieceList[i];
            var block = this.slotList[i];

            if ((img.x != block.x) || (img.y != block.y)) {
                // If one img is not equal to its block you are not finished
                return false;
            }
        }
        return true;
    };

}