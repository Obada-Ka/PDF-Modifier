export class DraggingShapes {
  checkBorders(allValues): any {
    let stringX = 'x';
    if (allValues.leftBottomCords.lowestYx) {
      stringX = 'lowestYx';
    }
    // check the page's top
    if (allValues.topBorderPointy < -26) {
      allValues.containerPosition = {
        x: allValues.eventXHolder,
        y: allValues.eventYHolder + Math.abs(allValues.topBorderPointy) + 2,
      };
      // 34 cuz there is top:-34px for iframe
      allValues.offsetYHolder =
        allValues.MypagePfHeight -
        allValues.leftBottomCords.y +
        allValues.MypagePfOffsetTop -
        allValues.containerPosition.y;
      allValues.eventYHolder = allValues.containerPosition.y;
      allValues.checkBorder = true;
    }
    // check the page's bottom
    if (allValues.bottomBorderPointy > allValues.MypagePfHeight - 34) {
      allValues.containerPosition = {
        x: allValues.eventXHolder,
        y:
          allValues.eventYHolder -
          (allValues.bottomBorderPointy - allValues.MypagePfHeight),
      };
      allValues.eventYHolder = allValues.containerPosition.y;
      allValues.offsetYHolder = 0;
      allValues.checkBorder = true;
    }
    // check the page's left
    if (allValues.leftBorderPointx < 0) {
      allValues.containerPosition = {
        x: allValues.eventXHolder + Math.abs(allValues.leftBorderPointx) + 2,
        y: allValues.eventYHolder,
      };
      // check if we are coorecting rectangle or polygonal left position for the X position
      allValues.offsetXHolder = allValues.leftBottomCords.lowestYx
        ? allValues.leftBottomCords.lowestYx -
          allValues.MypagePfOffsetLeft +
          allValues.containerPosition.x
        : 0;
      allValues.offsetYHolder === 0
        ? (allValues.offsetYHolder = 0)
        : (allValues.offsetYHolder -= allValues.eventYHolder);
      allValues.eventXHolder = allValues.containerPosition.x;
      allValues.checkBorder = true;
    }
    // check the page's right
    if (allValues.rightBorderPointx > allValues.MypagePfWidth) {
      allValues.containerPosition.x = 0;
      allValues.containerPosition.y = 0;
      allValues.containerPosition = {
        x:
          allValues.eventXHolder -
          (allValues.rightBorderPointx - allValues.MypagePfWidth),
        y: allValues.eventYHolder,
      };
      // check if we are coorecting rectangle or polygonal right position for the X position
      allValues.offsetXHolder =
        allValues.leftBottomCords[stringX] -
        allValues.MypagePfOffsetLeft +
        allValues.containerPosition.x;
      allValues.offsetYHolder === 0
        ? (allValues.offsetYHolder = 0)
        : (allValues.offsetYHolder -= allValues.eventYHolder);
      allValues.eventXHolder = allValues.containerPosition.x;
      allValues.checkBorder = true;
    }

    return allValues;
  }

  updateExactPosOffset(valuesToUpdate): any {
    const PagePF = 'page' + valuesToUpdate.workingPage;
    const pageBorderLeft =
      valuesToUpdate.pfXX.clientLeft +
      (valuesToUpdate.pfXX.getBoundingClientRect().left > 0
        ? valuesToUpdate.pfXX.getBoundingClientRect().left
        : 0);
    // valuesToUpdate.pfXX.getBoundingClientRect().left;
    const pageBorderTop =
      valuesToUpdate.pfXX.getBoundingClientRect().top -
      valuesToUpdate.pfXX.clientTop * 2;
    // const pageBorderTop = valuesToUpdate.pfXX.clientTop + valuesToUpdate.pfXX.getBoundingClientRect().top;
    const canvasPageWidth = valuesToUpdate.pfXX.clientWidth;
    /* const canvasPageHeight = Number(valuesToUpdate.iframePage.contentWindow.document.getElementById(PagePF)
        .style.height.replace('px', '')); */
    const canvasPageHeight = Number(
      valuesToUpdate.pfXX.style.height.replace('px', '')
    );
    let stringX = 'x';
    if (valuesToUpdate.leftBottomCords.lowestYx) {
      stringX = 'lowestYx';
    }
    let correctingY =
      pageBorderTop +
      canvasPageHeight +
      (valuesToUpdate.specificPage
        ? pageBorderTop < 0
          ? valuesToUpdate.iframePage.contentWindow.document.getElementById(
              'viewerContainer'
            ).scrollTop
          : 10
        : valuesToUpdate.iframePage.contentWindow.document.getElementById(
            'viewerContainer'
          ).scrollTop);
    let correctingX = pageBorderLeft;
    let finalX = valuesToUpdate.leftBottomCords[stringX] - correctingX;
    let finalY = correctingY - valuesToUpdate.leftBottomCords.y;
    if (valuesToUpdate.displacementXY) {
      correctingY -= valuesToUpdate.displacementXY.y;
      correctingX -= valuesToUpdate.displacementXY.x;
      finalX = valuesToUpdate.leftBottomCords[stringX] - correctingX;
      finalY = correctingY - valuesToUpdate.leftBottomCords.y;
      if (valuesToUpdate.correctValuesAfterBordersXY) {
        finalX = valuesToUpdate.correctValuesAfterBordersXY.x;
        finalY = valuesToUpdate.correctValuesAfterBordersXY.y;
      }
    }
    return {
      finalX,
      finalY,
    };
  }

  checkBordersLine(allValues): any {
    // check the page's top
    if (allValues.topBorderPointy < 0) {
      allValues.containerPosition = {
        x: allValues.eventXHolder,
        y: allValues.eventYHolder + Math.abs(allValues.topBorderPointy) + 2,
      };
      allValues.offsetYHolder =
        allValues.offsetYHolder +
        allValues.containerPosition.y -
        allValues.eventYHolder;
      allValues.eventYHolder = allValues.containerPosition.y;
      allValues.checkBorder = true;
    }
    // check the page's bottom
    if (allValues.bottomBorderPointy > allValues.MypagePfHeight) {
      allValues.containerPosition = {
        x: allValues.eventXHolder,
        y:
          allValues.eventYHolder -
          (allValues.bottomBorderPointy - allValues.MypagePfHeight),
      };
      allValues.offsetYHolder =
        allValues.offsetYHolder +
        allValues.containerPosition.y -
        allValues.eventYHolder -
        1;
      allValues.eventYHolder = allValues.containerPosition.y;
      allValues.checkBorder = true;
    }
    // check the page's left
    if (allValues.leftBorderPointx < 0) {
      allValues.containerPosition = {
        x: allValues.eventXHolder + Math.abs(allValues.leftBorderPointx) + 2,
        y: allValues.eventYHolder,
      };

      allValues.offsetXHolder =
        allValues.offsetXHolder +
        allValues.containerPosition.x -
        allValues.eventXHolder;
      allValues.eventXHolder = allValues.containerPosition.x;
      allValues.checkBorder = true;
    }
    // check the page's right
    if (allValues.rightBorderPointx > allValues.MypagePfWidth) {
      allValues.containerPosition = {
        x:
          allValues.eventXHolder -
          (allValues.rightBorderPointx - allValues.MypagePfWidth),
        y: allValues.eventYHolder,
      };

      allValues.offsetXHolder =
        allValues.offsetXHolder +
        allValues.containerPosition.x -
        allValues.eventXHolder;
      allValues.eventXHolder = allValues.containerPosition.x;
      allValues.checkBorder = true;
    }

    return allValues;
  }

  getMinMaxValuesXY(shape): any {
    const result = {
      minX: Infinity,
      maxX: -Infinity,
      minY: Infinity,
      maxY: -Infinity,
    };
    // if shape is Rectanle or Polygonal
    if (Array.isArray(shape)) {
      shape.forEach((line) => {
        // MinX
        if (result.minX > line.instance.getLowestX()) {
          result.minX = line.instance.getLowestX();
        }
        // MaxX
        if (result.maxX < line.instance.getHighestX()) {
          result.maxX = line.instance.getHighestX();
        }
        // MinY
        if (result.minY > line.instance.getLowestY()) {
          result.minY = line.instance.getLowestY();
          result.minY = result.minY;
        }
        // MaxY
        if (result.maxY < line.instance.getHighestY()) {
          result.maxY = line.instance.getHighestY();
          result.maxY = result.maxY;
        }
      });

      return result;
    }
    // if shape is Line
    else {
      if (result.minX > shape.instance.getLowestX()) {
        result.minX = shape.instance.getLowestX();
      }
      // MaxX
      if (result.maxX < shape.instance.getHighestX()) {
        result.maxX = shape.instance.getHighestX();
      }
      // MinY
      if (result.minY > shape.instance.getLowestY()) {
        result.minY = shape.instance.getLowestY();
        result.minY = result.minY;
      }
      // MaxY
      if (result.maxY < shape.instance.getHighestY()) {
        result.maxY = shape.instance.getHighestY();
        result.maxY = result.maxY;
      }
      return result;
    }
  }

  getLengthWidth(frame, workingPage, specificPage = false): any {
    const MyPage = frame.contentWindow.document.querySelectorAll('.page')[
      workingPage - 1
    ] as any;
    const PagePF = frame.contentWindow.document.getElementById(
      'page' + workingPage
    );
    return {
      // OffsetTop for class('.page') and the border with 9px
      MypagePfOffsetTop:
        (!specificPage
          ? MyPage.getBoundingClientRect().top
          : MyPage.getBoundingClientRect().height -
            MyPage.clientHeight +
            2 * MyPage.clientTop) + MyPage.clientTop,
      MypagePfOffsetLeft:
        (MyPage.getBoundingClientRect().left > 0
          ? MyPage.getBoundingClientRect().left
          : 0) + MyPage.clientLeft,
      MypagePfHeight: Number(MyPage.style.height.replace('px', '')),
      MypagePfWidth: Number(MyPage.style.width.replace('px', '')),
    };
  }
}
