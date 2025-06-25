var teachers = [];
var treeFunctions = {}

treeJSON = d3.json("/api/masters", function(error, treeData) {

        // Calculate total nodes, max label length
        var totalNodes = 0;
        var maxLabelLength = 20;
        // variables for drag/drop
        var selectedNode = null;
        var draggingNode = null;
        // panning variables
        var panSpeed = 200;
        var panBoundary = 20; // Within 20px from edges will pan when dragging.
        // Misc. variables
        var i = 0;
        var duration = 750;
        var root;

        // Get container dimensions instead of document dimensions
        var container = document.getElementById('tree-container');
        var viewerWidth = container.offsetWidth;
        var viewerHeight = container.offsetHeight;

        var tree = d3.layout.tree()
            .size([viewerHeight, viewerWidth]);

        // define a d3 diagonal projection for use by the node paths later on.
        var diagonal = d3.svg.diagonal()
            .projection(function(d) {
                return [d.y, d.x];
            });

        // Create right drawer for wiki content
        function createWikiDrawer() {
            // Remove existing drawer if any
            d3.select("#wiki-drawer").remove();
            
            // Create drawer container
            var drawer = d3.select("body").append("div")
                .attr("id", "wiki-drawer")
                .style("position", "fixed")
                .style("top", "0")
                .style("right", "-400px")
                .style("width", "400px")
                .style("height", "100vh")
                .style("background", "#ffffff")
                .style("border-left", "1px solid #e5e7eb")
                .style("box-shadow", "-4px 0 6px -1px rgba(0, 0, 0, 0.1)")
                .style("z-index", "1000")
                .style("transition", "right 0.3s ease-in-out")
                .style("display", "flex")
                .style("flex-direction", "column");

            // Create header
            var header = drawer.append("div")
                .style("padding", "1rem")
                .style("border-bottom", "1px solid #e5e7eb")
                .style("display", "flex")
                .style("justify-content", "space-between")
                .style("align-items", "center");

            header.append("h3")
                .attr("id", "drawer-title")
                .style("margin", "0")
                .style("font-size", "1.25rem")
                .style("font-weight", "600")
                .style("color", "#111827");

            header.append("button")
                .attr("id", "close-drawer")
                .style("background", "none")
                .style("border", "none")
                .style("font-size", "1.5rem")
                .style("cursor", "pointer")
                .style("color", "#6b7280")
                .style("padding", "0")
                .style("width", "24px")
                .style("height", "24px")
                .style("display", "flex")
                .style("align-items", "center")
                .style("justify-content", "center")
                .text("×")
                .on("click", closeWikiDrawer);

            // Create content area
            var content = drawer.append("div")
                .attr("id", "drawer-content")
                .style("flex", "1")
                .style("padding", "1rem")
                .style("overflow-y", "auto")
                .style("color", "#374151");

            // Create footer with edit button
            var footer = drawer.append("div")
                .style("padding", "1rem")
                .style("border-top", "1px solid #e5e7eb")
                .style("background", "#f9fafb");

            footer.append("button")
                .attr("id", "edit-wiki-btn")
                .style("width", "100%")
                .style("padding", "0.75rem 1rem")
                .style("background", "#dc2626")
                .style("color", "white")
                .style("border", "none")
                .style("border-radius", "0.375rem")
                .style("font-weight", "500")
                .style("cursor", "pointer")
                .style("transition", "background-color 0.2s")
                .text("Edit Wiki")
                .on("mouseover", function() {
                    d3.select(this).style("background", "#b91c1c");
                })
                .on("mouseout", function() {
                    d3.select(this).style("background", "#dc2626");
                })
                .on("click", function() {
                    var masterName = d3.select("#drawer-title").text();
                    var sanitizedName = masterName.replace(/[^\w\-\.]/g, '_');
                    window.open("/wiki/edit/" + sanitizedName, "_blank");
                });

            return drawer;
        }

        // Function to render markdown to HTML
        function renderMarkdown(markdown) {
            if (!markdown) return '';
            
            var html = markdown;
            
            // Code blocks (```code```)
            html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
            
            // Inline code (`code`)
            html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
            
            // Blockquotes (> text)
            html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');
            
            // Headings (# ## ###) - handle multiple spaces
            html = html.replace(/^###\s+(.*$)/gim, '<h3>$1</h3>');
            html = html.replace(/^##\s+(.*$)/gim, '<h2>$1</h2>');
            html = html.replace(/^#\s+(.*$)/gim, '<h1>$1</h1>');
            
            // Bold (**text**)
            html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            
            // Italic (*text*)
            html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
            
            // Links [text](url)
            html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
            
            // Process lists - first convert to list items
            var lines = html.split('\n');
            var inList = false;
            var listItems = [];
            
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i];
                
                // Check for list items
                if (line.match(/^[\*\-]\s+(.*)/) || line.match(/^\d+\.\s+(.*)/)) {
                    if (!inList) {
                        inList = true;
                        listItems = [];
                    }
                    listItems.push(line);
                } else {
                    // End of list
                    if (inList && listItems.length > 0) {
                        var listHtml = '<ul>';
                        for (var j = 0; j < listItems.length; j++) {
                            var item = listItems[j];
                            if (item.match(/^\d+\.\s+(.*)/)) {
                                if (j === 0) listHtml = '<ol>';
                            }
                            var content = item.replace(/^[\*\-]\s+(.*)/, '$1').replace(/^\d+\.\s+(.*)/, '$1');
                            listHtml += '<li>' + content + '</li>';
                        }
                        listHtml += (listItems[0].match(/^\d+\./) ? '</ol>' : '</ul>');
                        
                        // Replace the list items in the original lines
                        for (var k = 0; k < listItems.length; k++) {
                            var itemIndex = lines.indexOf(listItems[k]);
                            if (itemIndex !== -1) {
                                if (k === 0) {
                                    lines[itemIndex] = listHtml;
                                } else {
                                    lines[itemIndex] = '';
                                }
                            }
                        }
                        
                        inList = false;
                        listItems = [];
                    }
                }
            }
            
            // Handle any remaining list at the end
            if (inList && listItems.length > 0) {
                var listHtml = '<ul>';
                for (var j = 0; j < listItems.length; j++) {
                    var item = listItems[j];
                    if (item.match(/^\d+\.\s+(.*)/)) {
                        if (j === 0) listHtml = '<ol>';
                    }
                    var content = item.replace(/^[\*\-]\s+(.*)/, '$1').replace(/^\d+\.\s+(.*)/, '$1');
                    listHtml += '<li>' + content + '</li>';
                }
                listHtml += (listItems[0].match(/^\d+\./) ? '</ol>' : '</ul>');
                
                // Replace the list items in the original lines
                for (var k = 0; k < listItems.length; k++) {
                    var itemIndex = lines.indexOf(listItems[k]);
                    if (itemIndex !== -1) {
                        if (k === 0) {
                            lines[itemIndex] = listHtml;
                        } else {
                            lines[itemIndex] = '';
                        }
                    }
                }
            }
            
            html = lines.join('\n');
            
            // Paragraphs (double line breaks)
            html = html.replace(/\n\n/g, '</p><p>');
            
            // Single line breaks
            html = html.replace(/\n/g, '<br>');
            
            // Wrap in paragraph tags if not already wrapped
            if (!html.startsWith('<h') && !html.startsWith('<p') && !html.startsWith('<ul') && !html.startsWith('<ol') && !html.startsWith('<pre') && !html.startsWith('<blockquote')) {
                html = '<p>' + html + '</p>';
            }
            
            // Clean up empty paragraphs
            html = html.replace(/<p><\/p>/g, '');
            html = html.replace(/<p><br><\/p>/g, '');
            
            return html;
        }

        // Function to open wiki drawer
        function openWikiDrawer(masterName) {
            var drawer = d3.select("#wiki-drawer");
            if (drawer.empty()) {
                drawer = createWikiDrawer();
            }

            // Update title
            drawer.select("#drawer-title").text(masterName);

            // Load wiki content
            var sanitizedName = masterName.replace(/[^\w\-\.]/g, '_');
            d3.json("/api/wiki/" + sanitizedName, function(error, data) {
                var content = drawer.select("#drawer-content");
                if (error || !data || !data.content) {
                    content.html("<p style='color: #6b7280; font-style: italic;'>No wiki content available for this master. Click 'Edit Wiki' to create content.</p>");
                } else {
                    console.log("Raw markdown content:", data.content);
                    // Use proper markdown rendering
                    var htmlContent = renderMarkdown(data.content);
                    console.log("Processed HTML content:", htmlContent);
                    content.html(htmlContent);
                }
            });

            // Slide in drawer
            drawer.style("right", "0");
        }

        // Function to close wiki drawer
        function closeWikiDrawer() {
            var drawer = d3.select("#wiki-drawer");
            if (!drawer.empty()) {
                drawer.style("right", "-400px");
                setTimeout(function() {
                    drawer.remove();
                }, 300);
            }
        }

        // Function to update SVG dimensions on resize
        function updateSVGDimensions() {
            var container = document.getElementById('tree-container');
            var newWidth = container.offsetWidth;
            var newHeight = container.offsetHeight;
            
            if (baseSvg) {
                baseSvg
                    .attr("viewBox", "0 0 " + newWidth + " " + newHeight);
                
                // Update tree size
                tree.size([newHeight, newWidth]);
                
                // Update viewer dimensions
                viewerWidth = newWidth;
                viewerHeight = newHeight;
                
                // Recalculate tree layout if root exists
                if (root) {
                    update(root);
                }
            }
        }

        // Add resize listener with debouncing
        var resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function() {
                updateSVGDimensions();
            }, 250); // Debounce resize events
        });

        // A recursive helper function for performing some setup by walking through all nodes

        function visit(parent, visitFn, childrenFn) {
            if (!parent) return;

            visitFn(parent);

            var children = childrenFn(parent);
            if (children) {
                var count = children.length;
                for (var i = 0; i < count; i++) {
                    visit(children[i], visitFn, childrenFn);
                }
            }
        }

        // Call visit function to establish maxLabelLength
        visit(treeData, function(d) {
            totalNodes++;
            maxLabelLength = Math.max(d.master.name.length + d.master.name_native.length, maxLabelLength);

        }, function(d) {
            return d.children && d.children.length > 0 ? d.children : null;
        });


        // sort the tree according to the node names

        function sortTree() {
            tree.sort(function(a, b) {
                return (b.children != null) ? b.children.length : 0 < (a.children != null) ? a.children.length : 0;
            });
        }
        // Sort the tree initially incase the JSON isn't in a sorted order.
        //sortTree();

        // TODO: Pan function, can be better implemented.

        function pan(domNode, direction) {
            var speed = panSpeed;
            if (panTimer) {
                clearTimeout(panTimer);
                translateCoords = d3.transform(svgGroup.attr("transform"));
                if (direction == 'left' || direction == 'right') {
                    translateX = direction == 'left' ? translateCoords.translate[0] + speed : translateCoords.translate[0] - speed;
                    translateY = translateCoords.translate[1];
                } else if (direction == 'up' || direction == 'down') {
                    translateX = translateCoords.translate[0];
                    translateY = direction == 'up' ? translateCoords.translate[1] + speed : translateCoords.translate[1] - speed;
                }
                scaleX = translateCoords.scale[0];
                scaleY = translateCoords.scale[1];
                scale = zoomListener.scale();
                svgGroup.transition().attr("transform", "translate(" + translateX + "," + translateY + ")scale(" + scale + ")");
                d3.select(domNode).select('g.node').attr("transform", "translate(" + translateX + "," + translateY + ")");
                zoomListener.scale(zoomListener.scale());
                zoomListener.translate([translateX, translateY]);
                panTimer = setTimeout(function() {
                    pan(domNode, speed, direction);
                }, 50);
            }
        }

        // Define the zoom function for the zoomable tree

        function zoom() {
            svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
            // Update zoom slider value
            var currentScale = d3.event.scale;
            document.getElementById('zoom-slider').value = currentScale;
        }


        // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
        var zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoom);

        function initiateDrag(d, domNode) {
            draggingNode = d;
            d3.select(domNode).select('.ghostCircle').attr('pointer-events', 'none');
            d3.selectAll('.ghostCircle').attr('class', 'ghostCircle show');
            d3.select(domNode).attr('class', 'node activeDrag');

            svgGroup.selectAll("g.node").sort(function(a, b) { // select the parent and sort the path's
                if (a.id != draggingNode.id) return 1; // a is not the hovered element, send "a" to the back
                else return -1; // a is the hovered element, bring "a" to the front
            });
            // if nodes has children, remove the links and nodes
            if (nodes.length > 1) {
                // remove link paths
                links = tree.links(nodes);
                nodePaths = svgGroup.selectAll("path.link")
                    .data(links, function(d) {
                        return d.target.id;
                    }).remove();
                // remove child nodes
                nodesExit = svgGroup.selectAll("g.node")
                    .data(nodes, function(d) {
                        return d.id;
                    }).filter(function(d, i) {
                        if (d.id == draggingNode.id) {
                            return false;
                        }
                        return true;
                    }).remove();
            }

            // remove parent link
            parentLink = tree.links(tree.nodes(draggingNode.parent));
            svgGroup.selectAll('path.link').filter(function(d, i) {
                if (d.target.id == draggingNode.id) {
                    return true;
                }
                return false;
            }).remove();

            dragStarted = null;
        }

        // define the baseSvg, attaching a class for styling and the zoomListener
        var baseSvg = d3.select("#tree-container").append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", "0 0 " + viewerWidth + " " + viewerHeight)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .attr("class", "overlay")
            .call(zoomListener);


        // Define the drag listeners for drag/drop behaviour of nodes.
        dragListener = d3.behavior.drag()
            .on("dragstart", function(d) {
                if (d == root) {
                    return;
                }
                dragStarted = true;
                nodes = tree.nodes(d);
                d3.event.sourceEvent.stopPropagation();
                // it's important that we suppress the mouseover event on the node being dragged. Otherwise it will absorb the mouseover event and the underlying node will not detect it d3.select(this).attr('pointer-events', 'none');
            })
            .on("drag", function(d) {
                if (d == root) {
                    return;
                }
                if (dragStarted) {
                    domNode = this;
                    initiateDrag(d, domNode);
                }

                // get coords of mouseEvent relative to svg container to allow for panning
                relCoords = d3.mouse($('svg').get(0));
                if (relCoords[0] < panBoundary) {
                    panTimer = true;
                    pan(this, 'left');
                } else if (relCoords[0] > ($('svg').width() - panBoundary)) {

                    panTimer = true;
                    pan(this, 'right');
                } else if (relCoords[1] < panBoundary) {
                    panTimer = true;
                    pan(this, 'up');
                } else if (relCoords[1] > ($('svg').height() - panBoundary)) {
                    panTimer = true;
                    pan(this, 'down');
                } else {
                    try {
                        clearTimeout(panTimer);
                    } catch (e) {

                    }
                }

                d3.select(this).attr("transform", "translate(" + d3.event.x + "," + d3.event.y + ")");
                updateTempConnector();
            })
            .on("dragend", function(d) {
                if (d == root) {
                    return;
                }
                domNode = this;
                if (selectedNode) {
                    // now remove the element from the parent, and insert it into the new elements children
                    var index = draggingNode.parent.children.indexOf(draggingNode);
                    if (index > -1) {
                        draggingNode.parent.children.splice(index, 1);
                    }
                    if (typeof selectedNode.children !== 'undefined' || typeof selectedNode._children !== 'undefined') {
                        if (typeof selectedNode.children !== 'undefined') {
                            selectedNode.children.push(draggingNode);
                        } else {
                            selectedNode._children.push(draggingNode);
                        }
                    } else {
                        selectedNode.children = [];
                        selectedNode.children.push(draggingNode);
                    }
                    // Make sure that the node being added to is expanded so user can see added node is correct.
                    expand(selectedNode);
                    sortTree();
                    endDrag();
                } else {
                    endDrag();
                }
            });

        // Function to update the temporary connector indicating dragging alignment
        function updateTempConnector() {
            if (draggingNode !== null) {
                // remove the old line
                d3.select(".tempConnectLine").remove();
                // get the parent's position
                var parentNode = draggingNode.parent;
                var parentCoords = [parentNode.y0, parentNode.x0];
                // get the dragged node's position
                var draggedCoords = [draggingNode.y0, draggingNode.x0];
                // create a line joining these two co-ordinates
                var lineData = [{
                    "source": {
                        "x": parentCoords[0],
                        "y": parentCoords[1]
                    },
                    "target": {
                        "x": draggedCoords[0],
                        "y": draggedCoords[1]
                    }
                }];
                var link = svgGroup.selectAll(".tempConnectLine")
                    .data(lineData);

                link.enter().append("path")
                    .attr("class", "tempConnectLine")
                    .attr("d", d3.svg.diagonal())
                    .attr("stroke", "red")
                    .attr("stroke-width", 3)
                    .attr("fill", "none");

                link.attr("d", d3.svg.diagonal());
                link.exit().remove();
            }
        }

        // Function to end the drag
        function endDrag() {
            selectedNode = null;
            d3.selectAll('.ghostCircle').attr('class', 'ghostCircle');
            d3.select(domNode).attr('class', 'node');
            d3.select(domNode).select('.ghostCircle').attr('pointer-events', '');
            updateTempConnector();
            if (draggingNode !== null) {
                update(draggingNode);
                draggingNode = null;
            }
        }

        // helper functions
        function collapse(d) {
            if (d.children) {
                d._children = d.children;
                d._children.forEach(collapse);
                d.children = null;
            }
        }

        function expand(d) {
            if (d._children) {
                d.children = d._children;
                d.children.forEach(expand);
                d._children = null;
            }
        }

        var overCircle = function(d) {
            selectedNode = d;
            updateTempConnector();
        };
        var outCircle = function(d) {
            selectedNode = null;
            updateTempConnector();
        };

        // Function to center node when clicked so node doesn't get lost when collapsing with many children.
        function centerNode(source, highlight) {
            scale = zoomListener.scale();
            x = -source.y0;
            y = -source.x0;
            x = x * scale + viewerWidth / 2;
            y = y * scale + viewerHeight / 2;
            d3.select('g').transition()
                .duration(duration)
                .attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");
            zoomListener.scale(scale);
            zoomListener.translate([x, y]);
        }

        // Toggle children function
        function toggleChildren(d) {
            if (d.children) {
                d._children = d.children;
                d.children = null;
            } else if (d._children) {
                d.children = d._children;
                d._children = null;
            }
            return d;
        }

        // Toggle children on click.
        function click(d) {
            if (d3.event.defaultPrevented) return; // click suppressed
            d = toggleChildren(d);
            update(d);
            centerNode(d, true);
        }

        // Function to handle master name click for wiki drawer
        function clickMasterName(d) {
            console.log("clickMasterName called for:", d.master.name);
            d3.event.stopPropagation(); // Prevent node toggle
            openWikiDrawer(d.master.name);
        }

        function update(source) {
            // Compute the new height, function counts total children of root node and sets tree height accordingly.
            // This prevents the layout looking squashed when new nodes are made visible or looking sparse when nodes are removed
            // This makes the layout more compact.
            var levelWidth = [1];
            var childCount = function(level, n) {

                if (n.children && n.children.length > 0) {
                    if (levelWidth.length <= level + 1) levelWidth.push(0);

                    levelWidth[level + 1] += n.children.length;
                    n.children.forEach(function(d) {
                        childCount(level + 1, d);
                    });
                }
            };
            childCount(0, root);
            var newHeight = d3.max(levelWidth) * 80; // 80 pixels per line (increased from 60)
            tree = tree.size([newHeight, viewerWidth]);

            // Compute the new tree layout.
            var nodes = tree.nodes(root).reverse(),
                links = tree.links(nodes);

            // Set widths between levels based on maxLabelLength.
            nodes.forEach(function(d) {
                d.y = (d.depth * (maxLabelLength * 7)); //maxLabelLength * 10px
                // alternatively to keep a fixed scale one can set a fixed depth per level
                // Normalize for fixed-depth by commenting out below line
                // d.y = (d.depth * 500); //500px per level.
            });

            // Remove all existing elements first to ensure proper layering
            svgGroup.selectAll("path.link").remove();
            svgGroup.selectAll("g.node").remove();

            // Create links FIRST (bottom layer)
            var link = svgGroup.selectAll("path.link")
                .data(links, function(d) {
                    return d.target.id;
                });

            // Enter any new links at the parent's previous position.
            link.enter().append("path")
                .attr("class", "link")
                .attr("d", function(d) {
                    var o = {
                        x: source.x0,
                        y: source.y0
                    };
                    return diagonal({
                        source: o,
                        target: o
                    });
                })
                .attr("stroke", "#dc2626") // Red color for connecting lines
                .attr("stroke-width", 2)
                .attr("fill", "none");

            // Transition links to their new position.
            link.transition()
                .duration(duration)
                .attr("d", diagonal)
                .attr("stroke", "#dc2626") // Red color for connecting lines
                .attr("stroke-width", 2)
                .attr("fill", "none");

            // Transition exiting links to the parent's new position.
            link.exit().transition()
                .duration(duration)
                .attr("d", function(d) {
                    var o = {
                        x: source.x,
                        y: source.y
                    };
                    return diagonal({
                        source: o,
                        target: o
                    });
                })
                .remove();

            // Create nodes SECOND (middle layer) - this ensures nodes appear above links
            node = svgGroup.selectAll("g.node")
                .data(nodes, function(d) {
                    return d.id || (d.id = ++i);
                });

            // Enter any new nodes at the parent's previous position.
            var nodeEnter = node.enter().append("g")
                .attr("class", "node")
                .attr("transform", function(d) {
                    return "translate(" + source.y0 + "," + source.x0 + ")";
                })
                .on('click', click)
                .on("mouseover", function(d) {
                    overCircle(d);
                })
                .on("mouseout", function(d) {
                    outCircle(d);
                })
                .call(dragListener);

            // Add Circle for the nodes
            nodeEnter.append("circle")
                .attr("class", "nodeCircle")
                .attr("r", 0)
                .style("fill", function(d) {
                    return (d.children || d._children) ? "#dc2626" : "#fff";
                });

            // Add labels for the nodes (text will be on top naturally)
            var textEnter = nodeEnter.append("text")
                .attr("dy", ".35em")
                .attr("x", function(d) {
                    return d.children || d._children ? -13 : 13;
                })
                .attr("text-anchor", function(d) {
                    return d.children || d._children ? "end" : "start";
                })
                .text(function(d) {
                    return d.master.name;
                })
                .style("fill-opacity", 0)
                .style("cursor", "pointer")
                .style("font-size", "12px")
                .style("font-weight", "500")
                .style("pointer-events", "auto")
                .on("click", function(d) {
                    console.log("Text click handler triggered for:", d.master.name);
                    clickMasterName(d);
                })
                .on("mouseover", function() {
                    console.log("Text hover for:", d3.select(this).text());
                    d3.select(this).style("text-decoration", "underline");
                })
                .on("mouseout", function() {
                    d3.select(this).style("text-decoration", "none");
                });

            // Change the circle fill depending on whether it has children and is collapsed
            node.select("circle.nodeCircle")
                .attr("r", 4.5)
                .style("fill", function(d) {
                    return (d.children || d._children) ? "#dc2626" : "#fff";
                });

            // Change the text fill depending on whether it has children and is collapsed
            node.select("text")
                .style("fill-opacity", 1);

            // Transition nodes to their new position.
            var nodeUpdate = node.transition()
                .duration(duration)
                .attr("transform", function(d) {
                    return "translate(" + d.y + "," + d.x + ")";
                });

            // Fade the text in
            nodeUpdate.select("text")
                .style("fill-opacity", 1);

            // Transition exiting nodes to the parent's new position.
            var nodeExit = node.exit().transition()
                .duration(duration)
                .attr("transform", function(d) {
                    return "translate(" + source.y + "," + source.x + ")";
                })
                .remove();

            nodeExit.select("circle")
                .attr("r", 0);

            nodeExit.select("text")
                .style("fill-opacity", 0);

            // Stash the old positions for transition.
            nodes.forEach(function(d) {
                d.x0 = d.x;
                d.y0 = d.y;
            });
        }

        // Append a group which holds all nodes and which the zoom Listener can act upon.
        var svgGroup = baseSvg.append("g");

        // Define the root
        root = treeData;
        root.x0 = viewerHeight / 2;
        root.y0 = 0;

        // Layout the tree initially and center on the root node.
        update(root);
        
        // Ensure SVG dimensions are correct on initial load
        updateSVGDimensions();

        // Calculate the initial zoom to fit the entire tree
        var nodes = tree.nodes(root);
        var minX = d3.min(nodes, function(d) { return d.x; });
        var maxX = d3.max(nodes, function(d) { return d.x; });
        var minY = d3.min(nodes, function(d) { return d.y; });
        var maxY = d3.max(nodes, function(d) { return d.y; });
        
        var treeWidth = maxY - minY;
        var treeHeight = maxX - minX;
        
        var scaleX = (viewerWidth - 100) / treeWidth;
        var scaleY = (viewerHeight - 100) / treeHeight;
        var initialScale = Math.min(scaleX, scaleY, 1); // Don't zoom in more than 1x initially
        
        var translateX = viewerWidth / 2 - (maxY + minY) / 2 * initialScale;
        var translateY = viewerHeight / 2 - (maxX + minX) / 2 * initialScale;
        
        svgGroup.attr("transform", "translate(" + translateX + "," + translateY + ")scale(" + initialScale + ")");
        zoomListener.scale(initialScale);
        zoomListener.translate([translateX, translateY]);
        document.getElementById('zoom-slider').value = initialScale;

        // This function is called to expand the tree
        function expandAll() {
            expand(root);
            update(root);
            centerNode(root, false);
        }

        // This function is called to collapse the tree
        function collapseAll() {
            collapse(root);
            update(root);
            centerNode(root, false);
        }

        // Add the teachers data to the global array for search functionality
        teachers = [];
        function collectTeachers(node) {
            teachers.push(node);
            if (node.children) {
                node.children.forEach(collectTeachers);
            }
        }
        collectTeachers(root);

        // Expose functions for external use
        treeFunctions.centerNode = centerNode;
        treeFunctions.expandAll = expandAll;
        treeFunctions.collapseAll = collapseAll;
        treeFunctions.update = update;
        treeFunctions.root = root;
        treeFunctions.openWikiDrawer = openWikiDrawer;
        treeFunctions.closeWikiDrawer = closeWikiDrawer;

        // Debug function to test click handlers
        treeFunctions.testClickHandlers = function() {
            console.log("Testing click handlers...");
            var textElements = d3.selectAll('.node text');
            console.log("Found", textElements.size(), "text elements");
            
            textElements.each(function(d, i) {
                console.log("Text element", i, ":", d.master.name, "has click handler:", d3.select(this).on('click') !== null);
            });
            
            // Test the first text element
            if (textElements.size() > 0) {
                console.log("Testing first text element click...");
                var firstText = textElements.filter(function(d, i) { return i === 0; });
                console.log("First text:", firstText.text());
            }
        };

        // Test function to manually trigger wiki drawer
        treeFunctions.testWikiDrawer = function(masterName) {
            console.log("Testing wiki drawer for:", masterName);
            openWikiDrawer(masterName);
        };

        // Zoom slider functionality - completely rewritten
        var zoomSlider = document.getElementById('zoom-slider');
        var currentZoom = 1;
        
        // Set slider range and initial value
        zoomSlider.min = 0.1;
        zoomSlider.max = 3;
        zoomSlider.step = 0.05;
        zoomSlider.value = 1;
        
        // Function to apply zoom with center orientation
        function applyZoom(scale) {
            currentZoom = scale;
            
            // Calculate viewport center
            var centerX = viewerWidth / 2;
            var centerY = viewerHeight / 2;
            
            // Calculate tree bounds
            var nodes = tree.nodes(root);
            var minX = d3.min(nodes, function(d) { return d.x; });
            var maxX = d3.max(nodes, function(d) { return d.x; });
            var minY = d3.min(nodes, function(d) { return d.y; });
            var maxY = d3.max(nodes, function(d) { return d.y; });
            
            var treeCenterX = (maxX + minX) / 2;
            var treeCenterY = (maxY + minY) / 2;
            
            // Calculate translation to center the tree
            var translateX = centerX - (treeCenterX * scale);
            var translateY = centerY - (treeCenterY * scale);
            
            // Apply transform with smooth transition
            svgGroup.transition().duration(200)
                .attr('transform', 'translate(' + translateX + ',' + translateY + ') scale(' + scale + ')');
        }
        
        // Slider input event - real-time updates
        zoomSlider.addEventListener('input', function(e) {
            var scale = parseFloat(e.target.value);
            applyZoom(scale);
        });
        
        // Slider change event - final update
        zoomSlider.addEventListener('change', function(e) {
            var scale = parseFloat(e.target.value);
            applyZoom(scale);
        });
        
        // Zoom in/out buttons - faster zoom, always center
        document.getElementById('zoom-in').addEventListener('click', function() {
            var newScale = Math.min(3, currentZoom * 1.5);
            zoomSlider.value = newScale;
            applyZoom(newScale);
        });
        
        document.getElementById('zoom-out').addEventListener('click', function() {
            var newScale = Math.max(0.1, currentZoom / 1.5);
            zoomSlider.value = newScale;
            applyZoom(newScale);
        });
    });


/*
Portions of code are:

Copyright (c) 2013-2016, Rob Schmuecker

All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* The name Rob Schmuecker may not be used to endorse or promote products
  derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL MICHAEL BOSTOCK BE LIABLE FOR ANY DIRECT,
INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
