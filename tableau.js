function initViz() {
    var containerDiv = document.getElementById("vizContainer"),
    // url = "https://YOUR-SERVER/views/YOUR-VISUALIZATION";
    url = "https://public.tableau.com/views/RightiesThrowingChangeuptoRighties/2014-2015?:embed=y&:showVizHome=no&:host_url=https%3A%2F%2Fpublic.tableau.com%2F&:tabs=yes&:toolbar=yes&:animate_transition=yes&:display_static_image=no&:display_spinner=no&:display_overlay=yes&:display_count=yes&:showTabs=y&:loadOrderID=0";
    // options = {
    //     width: placeholderDiv.offsetWidth,
    //     height: placeholderDiv.offsetHeight,
    //     hideTabs: true,
    //     hideToolbar: true,
    //     onFirstInteractive: function () {
    //       workbook = viz.getWorkbook();
    //       activeSheet = workbook.getActiveSheet();
    //     }
    //   };        
    var viz = new tableau.Viz(containerDiv, url); 
}
document.onload = function () {
    alert('eh')
    initViz();
}
initViz();