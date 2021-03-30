# origo-filter-etuna

Gränssnitt för att filtrera föremål i kartan.

**Parametrar:**
- excludedAttributes: Egenskaper/attribut som inte ska listas i gränssnittet. **Valfri**.
- excludedLayers: Lager som inte ska listas i gränssnittet. Baseras på lagrets namn. **Valfri**.
- optionBackgroundColor: Bakgrundsfärg på filterade lager i lagerlistan. **Valfri**.
- filterPrefix: Prefix på filtrerade lager i lagerlistan. **Valfri**.
- indicatorBackgroundColor: Bakgrundsfärg för indikatorn på antal aktiva filter. **Valfri**.
- indicatorTextColor: Färg på texten för indikatorn på antal aktiva filter. **Valfri**.

**Material icons som används:**
- ic_delete_24px
- ic_edit_24px
- ic_visibility_24px

**Exempel:**
```HTML
<script type="text/javascript">
    var origo = Origo('index.json');
    origo.on('load', function (viewer) {
      var origofilteretuna = Origofilteretuna({
        excludedAttributes: ['geom', 'sokid'],
        excludedLayers: ['sokvyx_djupdata_djuppunkter_vy'],
        optionBackgroundColor: '#e1f2fe',
        filterPrefix: 'Filter - ',
        indicatorBackgroundColor: '#ff0000',
        indicatorTextColor: '#ffffff'
      });
      viewer.addComponent(origofilteretuna);
    });
</script>
```

### Demo filtrering
![](filter1.gif)
