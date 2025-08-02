<script lang="ts">
  export let title: string;
  export let value: string;
  export let icon: string;
  export let color: 'blue' | 'green' | 'purple' | 'orange' | 'red' = 'blue';
  export let trend: string | undefined = undefined;
  export let trendUp: boolean = true;

  const colorClasses = {
    blue: 'border-l-blue-500 text-blue-600',
    green: 'border-l-green-500 text-green-600',
    purple: 'border-l-purple-500 text-purple-600',
    orange: 'border-l-orange-500 text-orange-600',
    red: 'border-l-red-500 text-red-600'
  };
</script>

<div class="bg-[#2B2B2B] rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-200 border-l-4 {colorClasses[color]}">
  <div class="flex items-center">
    <div class="text-3xl mr-4">{icon}</div>
    <div class="flex-1">
      <h3 class="text-2xl font-bold text-[#F0F0F0] mb-1">{value}</h3>
      <p class="text-[#A0A0A0] text-sm">{title}</p>
      {#if trend}
        <p class="text-xs mt-1 {trendUp ? 'text-[#85D5C8]' : 'text-red-400'}">
          {trendUp ? '↑' : '↓'} {trend}
        </p>
      {/if}
    </div>
  </div>
</div>
