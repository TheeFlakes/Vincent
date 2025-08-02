<script>
    import { onMount } from 'svelte';
    import { Chart, registerables } from 'chart.js';
    
    let { 
        type = 'line',
        data = {},
        options = {},
        height = '400px',
        id = `chart-${Math.random().toString(36).substr(2, 9)}`
    } = $props();
    
    let chartCanvas;
    let chartInstance;
    
    // Default options for dark theme
    const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: '#F0F0F0',
                    font: {
                        size: 12
                    }
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: '#A0A0A0',
                    font: {
                        size: 11
                    }
                },
                grid: {
                    color: '#3B3B3B'
                }
            },
            y: {
                ticks: {
                    color: '#A0A0A0',
                    font: {
                        size: 11
                    }
                },
                grid: {
                    color: '#3B3B3B'
                }
            }
        }
    };
    
    // Merge options
    const mergedOptions = { ...defaultOptions, ...options };
    
    onMount(() => {
        Chart.register(...registerables);
        
        if (chartCanvas) {
            chartInstance = new Chart(chartCanvas, {
                type,
                data,
                options: mergedOptions
            });
        }
        
        return () => {
            if (chartInstance) {
                chartInstance.destroy();
            }
        };
    });
    
    // Update chart when data changes
    $effect(() => {
        if (chartInstance && data) {
            chartInstance.data = data;
            chartInstance.update();
        }
    });
</script>

<div class="w-full" style="height: {height}">
    <canvas bind:this={chartCanvas} {id}></canvas>
</div>
