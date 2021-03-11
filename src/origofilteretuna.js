import Origo from 'Origo';

const Origofilteretuna = function Origofilteretuna(options = {}) {
  let viewer;
  let target;
  let filterDiv;
  let filterButton;
  let filterBox;
  let filterBoxContent;
  let simpleModeButton;
  let advancedModeButton;
  let createFilterButton;
  let removeAllFilterButton;
  let removeFilterButton;
  let removeAttributeButton;
  let addAttributeButton;
  let modeControl;
  let dividerTop;
  let dividerBottom;
  let layerSelect;
  let attributeSelect;
  let operatorSelect;
  let logicSelect;
  let attributeRow;
  let attributeText;
  let operatorText;
  let logicFirstText;
  let logicSecondText;
  let valueText;
  let advancedText;
  let layerText;
  let attributeTextDiv;
  let addAttributeDiv;
  let logicDiv;
  let simpleDiv;
  let advancedDiv;
  let filterContentDiv;
  let cqlStringTextarea;
  let filterInput;
  let selectedLayer;
  let layers;
  let properties;
  let isActive = false;
  let mode = 'simple';
  const tag = 'Filter - ';
  const dom = Origo.ui.dom;
  const operators = [' = ', ' <> ', ' < ', ' > ', ' <= ', ' >= ', ' like ', ' between '];
  const geoserverUrl = Object.prototype.hasOwnProperty.call(options, 'geoserverUrl') ? options.geoserverUrl : null;
  const excludedAttributes = Object.prototype.hasOwnProperty.call(options, 'excludedAttributes') ? options.excludedAttributes : [];

  function setActive(state) {
    isActive = state;
  }

  function toggleFilter() {
    const detail = {
      name: 'filter',
      active: !isActive
    };
    viewer.dispatch('toggleClickInteraction', detail);
  }

  function getLayersWithType(type) {
    const layersWithType = [];

    viewer.getLayers().forEach((layer) => {
      if (layer.get('type') === type) {
        layersWithType.push(layer);
      }
    });

    return layersWithType;
  }

  function getCqlFilterFromLayer(layer) {
    let filter = '';
    const params = layer.getSource().getParams();
    if (params.CQL_FILTER) {
      filter = params.CQL_FILTER;
    }
    return filter;
  }

  async function addAttributeRow(attribute, operator, value, firstRow) {
    const row = document.getElementsByClassName('attributeRow')[0];
    const clone = firstRow ? row : row.cloneNode(true);

    if (attribute) {
      const attrIndex = properties.findIndex(prop => prop.name === attribute);
      clone.querySelector(`#${attributeSelect.getId()}`).selectedIndex = attrIndex;
    }

    if (operator) {
      const oprIndex = operators.findIndex(opr => opr === operator);
      clone.querySelector(`#${operatorSelect.getId()}`).selectedIndex = oprIndex;
    }

    if (value) {
      clone.querySelector('input').value = value;
    } else {
      clone.querySelector('input').value = '';
    }

    if (!firstRow) {
      clone.querySelector('button').classList.remove('o-hidden');
      clone.querySelector('button').addEventListener('click', () => {
        clone.remove();
      });
    }

    const lastElement = document.getElementsByClassName('attributeRow').length - 1;
    document.getElementsByClassName('attributeRow')[lastElement].after(clone);
  }

  function removeAttributeRows() {
    document.getElementsByClassName('attributeRow')[0].querySelector(`#${attributeSelect.getId()}`).selectedIndex = 0;
    document.getElementsByClassName('attributeRow')[0].querySelector(`#${operatorSelect.getId()}`).selectedIndex = 0;
    document.getElementsByClassName('attributeRow')[0].querySelector('input').value = '';

    const rows = document.getElementsByClassName('attributeRow').length;
    for (let i = 1; i < rows; i += 1) {
      document.getElementsByClassName('attributeRow')[1].remove();
    }
  }

  function setAttributeRowsToFilter(filterString) {
    if (filterString !== '') {
      const hasOR = filterString.includes(' OR ');
      const hasAND = filterString.includes(' AND ');

      // Om det finns både OR och AND så kan det inte visas korrekt i det enkla gränssnittet.
      if (hasOR && hasAND) return;

      const logicOperator = hasOR ? 'OR' : 'AND';
      const filterArray = filterString.split(` ${logicOperator} `);
      document.getElementById(logicSelect.getId()).selectedIndex = hasAND ? 1 : 0;

      removeAttributeRows();

      filterArray.forEach((filter, index) => {
        const filterArr = filter.split(' ');
        const attr = filterArr[0];
        const opr = filterArr[1];
        const value = filterArr[2].replaceAll("'", '');
        const firstRow = index === 0;
        addAttributeRow(attr, ` ${opr} `, value, firstRow);
      });
    }
  }

  function setMode(modeString) {
    mode = modeString;

    if (mode === 'simple') {
      document.getElementById(simpleModeButton.getId()).classList.add('active');
      document.getElementById(advancedModeButton.getId()).classList.remove('active');
      document.getElementById(simpleDiv.getId()).classList.remove('o-hidden');
      document.getElementById(advancedDiv.getId()).classList.add('o-hidden');
    } else if (mode === 'advanced') {
      document.getElementById(simpleModeButton.getId()).classList.remove('active');
      document.getElementById(advancedModeButton.getId()).classList.add('active');
      document.getElementById(simpleDiv.getId()).classList.add('o-hidden');
      document.getElementById(advancedDiv.getId()).classList.remove('o-hidden');
    }

    if (selectedLayer) {
      const filterString = getCqlFilterFromLayer(selectedLayer);
      setAttributeRowsToFilter(filterString);
    }
  }

  function removeFilterTag() {
    const select = document.getElementById(layerSelect.getId());
    const currentText = select.options[select.selectedIndex].text;
    select.options[select.selectedIndex].text = currentText.replace(tag, '');
  }

  function removeAllFilterTags() {
    const select = document.getElementById(layerSelect.getId());
    select.options.forEach((option) => {
      select.options[option.index].text = option.text.replace(tag, '');
    });
  }

  function addFilterTag() {
    removeFilterTag();
    const select = document.getElementById(layerSelect.getId());
    const currentText = select.options[select.selectedIndex].text;
    select.options[select.selectedIndex].text = `${tag}${currentText}`;
  }

  function createCqlFilter() {
    let filterString = '';
    if (mode === 'simple') {
      const filters = [];
      const rows = document.getElementsByClassName('attributeRow');
      const logic = document.getElementById(logicSelect.getId()).value;

      rows.forEach((row) => {
        const att = row.querySelector(`#${attributeSelect.getId()}`).value;
        const opr = row.querySelector(`#${operatorSelect.getId()}`).value;
        const val = row.querySelector('input').value;

        if (val !== '') {
          filters.push(`${att}${opr}'${val}'`);
        }
      });

      filterString = filters.join(` ${logic} `);
      document.getElementById(cqlStringTextarea.getId()).value = filterString;
    } else if (mode === 'advanced') {
      filterString = document.getElementById(cqlStringTextarea.getId()).value;
    }
    selectedLayer.getSource().updateParams({ layers: selectedLayer.get('name'), CQL_FILTER: filterString });
    if (getCqlFilterFromLayer(selectedLayer) !== '') {
      addFilterTag();
    }
  }

  function removeCqlFilter() {
    document.getElementById(cqlStringTextarea.getId()).value = '';
    selectedLayer.getSource().updateParams({ layers: selectedLayer.get('name'), CQL_FILTER: undefined });
    removeFilterTag();
    removeAttributeRows();
  }

  function removeAllCqlFilter() {
    document.getElementById(cqlStringTextarea.getId()).value = '';
    layers.forEach((layer) => {
      layer.getSource().updateParams({ layers: layer.get('name'), CQL_FILTER: undefined });
    });
    removeAllFilterTags();
    removeAttributeRows();
  }

  async function getProperties(layerName) {
    const filteredProps = [];
    const url = [
      `${geoserverUrl}`,
      '/wfs?version=1.3.0&request=describeFeatureType&outputFormat=application/json&service=WFS',
      `&typeName=${layerName}`
    ].join('');

    const response = await fetch(url)
      .then(res => res.json());

    response.featureTypes[0].properties.forEach((prop) => {
      if (!excludedAttributes.includes(prop.name)) {
        filteredProps.push(prop);
      }
    });

    return filteredProps;
  }

  function initAttributesWithProperties() {
    document.getElementsByClassName('attributeSelect').forEach((attrSelect) => {
      // Rensa eventuellt existerande options
      while (attrSelect.firstChild) {
        attrSelect.removeChild(attrSelect.firstChild);
      }

      // Lägg till lagrets attribut/properties till select
      properties.forEach((property) => {
        const attribute = property.name;
        const opt = document.createElement('option');
        opt.text = attribute;
        opt.value = attribute;
        attrSelect.appendChild(opt);
      });
    });
  }

  function initLayerSelect() {
    const select = document.getElementById(layerSelect.getId());

    // Lägg till alla lager till select
    layers.forEach((queryableLayer) => {
      const opt = document.createElement('option');
      opt.text = queryableLayer.get('title');
      opt.value = queryableLayer.get('name');
      select.appendChild(opt);
    });

    document.getElementsByClassName('operatorSelect').forEach((oprSelect) => {
      // Rensa eventuellt existerande options
      while (oprSelect.firstChild) {
        oprSelect.removeChild(oprSelect.firstChild);
      }

      // Lägg till operators till select
      operators.forEach((operator) => {
        const opt = document.createElement('option');
        opt.text = operator;
        opt.value = operator;
        oprSelect.appendChild(opt);
      });
    });

    select.addEventListener('change', async (e) => {
      if (e.target.value !== '') {
        selectedLayer = viewer.getLayer(e.target.value);
        properties = await getProperties(selectedLayer.get('name'));

        initAttributesWithProperties(properties);
        removeAttributeRows();

        const currentFilter = getCqlFilterFromLayer(selectedLayer);
        document.getElementById(cqlStringTextarea.getId()).value = currentFilter;

        if (currentFilter !== '') {
          setAttributeRowsToFilter(currentFilter);
        } else {
          document.getElementById(logicSelect.getId()).selectedIndex = 0;
          const firstAttributeRow = document.getElementsByClassName('attributeRow')[0];
          firstAttributeRow.querySelector('input').value = '';
          firstAttributeRow.querySelector(`#${operatorSelect.getId()}`).value = operators[0];
        }

        document.getElementById(filterContentDiv.getId()).classList.remove('o-hidden');
      } else {
        document.getElementById(filterContentDiv.getId()).classList.add('o-hidden');
      }
    });
  }


  function enableInteraction() {
    document.getElementById(filterButton.getId()).classList.add('active');
    document.getElementById(filterButton.getId()).classList.remove('tooltip');
    document.getElementById(filterBox.getId()).classList.remove('o-hidden');

    setActive(true);
  }

  function disableInteraction() {
    document.getElementById(filterButton.getId()).classList.remove('active');
    document.getElementById(filterButton.getId()).classList.add('tooltip');
    document.getElementById(filterBox.getId()).classList.add('o-hidden');

    setActive(false);
  }

  return Origo.ui.Component({
    name: 'origofilteretuna',
    onInit() {
      filterDiv = Origo.ui.Element({
        tagName: 'div',
        cls: 'flex column'
      });

      filterButton = Origo.ui.Button({
        cls: 'o-multiselect padding-small margin-bottom-smaller icon-smaller round light box-shadow',
        click() {
          toggleFilter();
        },
        icon: '#fa-times',
        tooltipText: 'Filter',
        tooltipPlacement: 'east'
      });

      filterBox = Origo.ui.Element({
        tagName: 'div',
        cls: 'flex column control box bg-white overflow-hidden z-index-top o-hidden filter-box',
        style: 'left: 4rem; top: 1rem; padding: 0.5rem; width: 320px;'
      });

      simpleModeButton = Origo.ui.Button({
        cls: 'grow light text-smaller padding-left-large active',
        text: 'Enkel',
        state: mode === 'simple' ? 'active' : 'initial'
      });

      advancedModeButton = Origo.ui.Button({
        cls: 'grow light text-smaller padding-right-large',
        text: '1337-läge',
        state: mode === 'advanced' ? 'active' : 'initial'
      });

      modeControl = Origo.ui.ToggleGroup({
        cls: 'flex rounded bg-inverted border',
        components: [simpleModeButton, advancedModeButton],
        style: { display: 'flex' }
      });

      filterBox = Origo.ui.Element({
        tagName: 'div',
        cls: 'flex column control box bg-white overflow-hidden z-index-top o-hidden filter-box',
        style: 'left: 4rem; top: 1rem; padding: 0.5rem; width: 320px;'
      });

      layerSelect = Origo.ui.Element({
        tagName: 'select',
        cls: 'width-100',
        style: 'font-size: 0.8rem; padding: 0.2rem;',
        innerHTML: '<option value="">Välj...</option>'
      });

      attributeSelect = Origo.ui.Element({
        tagName: 'select',
        cls: 'attributeSelect',
        style: 'font-size: 0.8rem; padding: 0.2rem; width: 44%;'
      });

      operatorSelect = Origo.ui.Element({
        tagName: 'select',
        cls: 'operatorSelect',
        style: 'font-size: 0.8rem; padding: 0.2rem; width: 80px; margin-left: 0.4rem;'
      });

      logicSelect = Origo.ui.Element({
        tagName: 'select',
        style: 'font-size: 0.7rem; padding: 0.2rem;',
        innerHTML: '<option value="OR">något</option><option value="AND">alla</option>'
      });

      dividerTop = Origo.ui.Element({
        tagName: 'div',
        style: 'margin-bottom: 0.5rem; margin-top: 0.5rem; height: 1px; background-color: #e8e8e8;'
      });

      dividerBottom = Origo.ui.Element({
        tagName: 'div',
        style: 'margin-bottom: 0.5rem; margin-top: 0.5rem; height: 1px; background-color: #e8e8e8;'
      });

      createFilterButton = Origo.ui.Button({
        cls: 'light rounded border text-smaller padding-right-large o-tooltip',
        style: 'float: left; background-color: #ebebeb; padding: 0.4rem;',
        text: 'Filtrera'
      });

      removeAllFilterButton = Origo.ui.Button({
        cls: 'light rounded border text-smaller padding-right-large o-tooltip',
        style: 'float: right; background-color: #ebebeb; padding: 0.4rem;',
        text: 'Rensa allt'
      });

      removeFilterButton = Origo.ui.Button({
        cls: 'light rounded border text-smaller padding-right-large o-tooltip',
        style: 'float: right; background-color: #ebebeb; padding: 0.4rem;',
        text: 'Rensa'
      });

      filterInput = Origo.ui.Input({
        cls: 'placeholder-text-smaller smaller',
        value: '',
        placeholderText: '...',
        style: 'height: 1.5rem; margin: 0; width: 20%;'
      });

      removeAttributeButton = Origo.ui.Button({
        cls: 'light rounded border text-smaller padding-right-large o-tooltip removeAttributeButton o-hidden',
        style: 'float: right; background-color: #ffa6a6; padding: 0.1rem; height: 24px; margin-top: 2px;',
        textCls: 'font-size: 1rem; font-weight: bold; line-height: 0px;',
        text: '&times;'
      });

      attributeRow = Origo.ui.Element({
        tagName: 'div',
        cls: 'attributeRow',
        components: [attributeSelect, operatorSelect, filterInput, removeAttributeButton]
      });

      attributeText = Origo.ui.Element({
        tagName: 'p',
        cls: 'text-smaller',
        style: 'width: 9rem; padding-left: 5px;',
        innerHTML: 'Attribut'
      });

      operatorText = Origo.ui.Element({
        tagName: 'p',
        cls: 'text-smaller',
        style: 'width: 5.3rem;',
        innerHTML: 'Operator'
      });

      valueText = Origo.ui.Element({
        tagName: 'p',
        cls: 'text-smaller',
        innerHTML: 'Värde'
      });

      attributeTextDiv = Origo.ui.Element({
        tagName: 'div',
        cls: 'flex',
        components: [attributeText, operatorText, valueText]
      });

      addAttributeButton = Origo.ui.Button({
        cls: 'light rounded border text-smaller padding-right-large o-tooltip',
        style: 'float: left; background-color: #ebebeb; padding: 0.2rem;',
        text: 'Lägg till attribut'
      });

      addAttributeDiv = Origo.ui.Element({
        tagName: 'div',
        style: 'display: inline-block;',
        components: [addAttributeButton]
      });

      logicFirstText = Origo.ui.Element({
        tagName: 'p',
        style: 'line-height: 1.3rem;',
        innerHTML: 'Filtrera'
      });

      logicSecondText = Origo.ui.Element({
        tagName: 'p',
        style: 'line-height: 1.3rem;',
        innerHTML: 'av följande'
      });

      logicDiv = Origo.ui.Element({
        tagName: 'div',
        cls: 'flex text-smaller',
        components: [logicFirstText, logicSelect, logicSecondText]
      });

      simpleDiv = Origo.ui.Element({
        tagName: 'div',
        components: [logicDiv, attributeTextDiv, attributeRow, addAttributeDiv]
      });

      advancedText = Origo.ui.Element({
        tagName: 'p',
        cls: 'text-smaller',
        innerHTML: 'CQL-sträng:'
      });

      cqlStringTextarea = Origo.ui.Textarea({
        placeholderText: '',
        cls: 'text-smaller width-100'
      });

      advancedDiv = Origo.ui.Element({
        tagName: 'div',
        cls: 'o-hidden',
        components: [advancedText, cqlStringTextarea]
      });

      filterContentDiv = Origo.ui.Element({
        tagName: 'div',
        cls: 'o-hidden',
        components: [dividerTop, simpleDiv, advancedDiv, dividerBottom, createFilterButton, removeAllFilterButton, removeFilterButton]
      });

      layerText = Origo.ui.Element({
        tagName: 'p',
        cls: 'text-smaller',
        innerHTML: 'Lager:'
      });

      filterBoxContent = Origo.ui.Element({
        tagName: 'div',
        components: [modeControl, layerText, layerSelect, filterContentDiv]
      });
    },
    onAdd(evt) {
      if (geoserverUrl) {
        viewer = evt.target;
        target = `${viewer.getMain().getMapTools().getId()}`;
        layers = getLayersWithType('WMS');

        this.addComponents([filterButton]);
        this.render();

        initLayerSelect();
        viewer.on('toggleClickInteraction', (detail) => {
          if (detail.name === 'filter' && detail.active) {
            enableInteraction();
          } else {
            disableInteraction();
          }
        });
      }
    },
    render() {
      document.getElementById(target).appendChild(dom.html(filterDiv.render()));
      document.getElementById(filterDiv.getId()).appendChild(dom.html(filterButton.render()));
      document.getElementById(viewer.getMain().getId()).appendChild(dom.html(filterBox.render()));
      document.getElementById(filterBox.getId()).appendChild(dom.html(filterBoxContent.render()));

      document.getElementById(createFilterButton.getId()).addEventListener('click', () => createCqlFilter());
      document.getElementById(removeFilterButton.getId()).addEventListener('click', () => removeCqlFilter());
      document.getElementById(removeAllFilterButton.getId()).addEventListener('click', () => removeAllCqlFilter());
      document.getElementById(addAttributeButton.getId()).addEventListener('click', () => addAttributeRow());
      document.getElementById(simpleModeButton.getId()).addEventListener('click', () => setMode('simple'));
      document.getElementById(advancedModeButton.getId()).addEventListener('click', () => setMode('advanced'));

      this.dispatch('render');
    }
  });
};

export default Origofilteretuna;
